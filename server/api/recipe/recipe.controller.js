'use strict';

var _ = require('lodash');
var Recipe = require('./recipe.model').recipe;
var Word = require('./recipe.model').word;
var Source = require('../source/source.model');
var request = require('request');
var cheerio = require('cheerio');
var mwdictkey = require('../../config/environment/production').mwdictkey;

// Get list of recipes
exports.index = function(req, res) {
  Recipe.find(function (err, recipes) {
    if(err) { return handleError(res, err); }
    return res.json(200, recipes);
  });
};

// Get a single recipe
exports.show = function(req, res) {
  Recipe.findById(req.params.id, function (err, recipe) {
    if(err) { return handleError(res, err); }
    if(!recipe) { return res.send(404); }
    return res.json(recipe);
  });
};

// Creates a new recipe in the DB.
exports.create = function(req, res) {
  Recipe.create(req.body, function(err, recipe) {
    if(err) { return handleError(res, err); }
    return res.json(201, recipe);
  });
};

// Updates an existing recipe in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Recipe.findById(req.params.id, function (err, recipe) {
    if (err) { return handleError(res, err); }
    if(!recipe) { return res.send(404); }
    var updated = _.merge(recipe, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, recipe);
    });
  });
};

// Deletes a recipe from the DB.
exports.destroy = function(req, res) {
  Recipe.findById(req.params.id, function (err, recipe) {
    if(err) { return handleError(res, err); }
    if(!recipe) { return res.send(404); }
    recipe.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
exports.tagRecipe = function(req, res) {
  var url = req.body.url;
  var fixed_url = fixUrl(url);
  var domain = fixed_url.substring(0, fixed_url.substring(8).indexOf('/')+8);
  Source.findOne({url:domain}, function(err, item) {
    var selector = item.selector;
    request(url, function(err, response, body) {
      if(!err && response.statusCode==200){
        var $ = cheerio.load(body);
        var text = $(selector).text()
                      .toLowerCase()
                      .replace(/[\.,\/#!$%\^&\*;:{}=_`~()0-9]/g,"")
                      .replace(/[\t\n]/g," ")
                      .replace(/\s{2,}/g," ")
                      .split(" ");
        var unique_words = _.unique(text);
        var len = unique_words.length;
        var i=0;
      }
      console.log("Number of unique words: " + unique_words.length);
      var lookup_count=0;
      var recursiveWordLoop = function(index) {
        console.log(index);
        if(index>=len) {
          console.log("END");
          console.log("Looked up " + String(Math.round(100*lookup_count/index)) + "% of words");
          res.send("Finished!");
        } else if(!!unique_words[index]) {
          var search_word = unique_words[index];
          Word.findOne({word: search_word}, function(mongo_err, mongo_obj){
            if(mongo_err) {
              console.log("**Mongo Error: " + mongo_err + "**");
            }
            else if(!mongo_obj) {
              var mw_url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + search_word + "?key=" + mwdictkey;
              request(mw_url, function(dict_err, dict_response, dict_body) {
                if(dict_err) {
                  console.log("**Dictionary lookup error: " + dict_err + "**");
                } else {
                  $ = cheerio.load(dict_body);
                  var base_obj= $("ew");
                  if(!!base_obj.length) {
                    var base_word = base_obj.first().text();
                    var new_word = new Word({
                      word: unique_words[index],
                      base: base_word
                    });
                    new_word.save();
                    lookup_count++;
                    recursiveWordLoop(index+1);
                  } else {
                    recursiveWordLoop(index+1);
                  }
                }
              });
            } else {
              recursiveWordLoop(index+1);
            }
          });
        } else {
          recursiveWordLoop(index+1);
        }
      };
      recursiveWordLoop(i);
    });
  });
};

//Gets rid of the www in a url
function fixUrl(url) {
  if(url.substring(0,5) === "www.") {
    var fixed_url = "http://" + url.substring(4);
  }
  else if(url.substring(0,11)==="http://www.") {
    fixed_url = "http://" + url.substring(11);
  }
  else {
    fixed_url=url;
  }
  // console.log(fixed_url);
  return fixed_url;
};

function handleError(res, err) {
  return res.send(500, err);
}