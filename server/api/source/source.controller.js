'use strict';

var _ = require('lodash');
var Source = require('./source.model').source;
var Tag = require('./source.model').tag;
var Recipe = require('./source.model').recipe;
var Word = require('./source.model').word;
var cheerio = require('cheerio');
var request = require('request');
var f2fkey = require('../../config/environment/production').f2fkey;
var querystring = require('querystring');
var fs = require('fs');
var mwdictkey = require('../../config/environment/production').mwdictkey;
// var socket = require('socket.io')(323);

// Get list of sources
exports.index = function(req, res) {
  Source.find(function (err, sources) {
    if(err) { return handleError(res, err); }
    return res.json(200, sources);
  });
};

// Get a single source
exports.show = function(req, res) {
  Source.findById(req.params.id, function (err, source) {
    if(err) { return handleError(res, err); }
    if(!source) { return res.send(404); }
    return res.json(source);
  });
};

// Creates a new source in the DB.
exports.create = function(req, res) {
  Source.create(req.body, function(err, source) {
    if(err) { return handleError(res, err); }
    return res.json(201, source);
  });
};

// Updates an existing source in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Source.findById(req.params.id, function (err, source) {
    if (err) { return handleError(res, err); }
    if(!source) { return res.send(404); }
    var updated = _.merge(source, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, source);
    });
  });
};

// Updates a source if it exists and creates it if it doesn't exist
exports.updateOrCreate = function(req, res) {
  var obj = req.body;
  if(!!obj.selector) {
    obj.pending=false;
  } else {
    obj.pending=true;
  }
  Source.findOneAndUpdate({url:obj.url}, obj, {upsert:true}, function(err, source){
    if(err) {
      console.log("***ERROR IN SOURCE.UPDATEORCREATE #1***");
    } else {
      Source.find({}, function(err, sourceArr) {
        if(err) {
          console.log("***ERROR IN SOURCE.UPDATEORCREATE*** #2")
        } else {
          console.log(sourceArr);
          res.json(200, {'array':sourceArr});
        }
      });
    }
  })
};

// Deletes a source from the DB.
exports.destroy = function(req, res) {
  Source.findById(req.params.id, function (err, source) {
    if(err) { return handleError(res, err); }
    if(!source) { return res.send(404); }
    source.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Returns results of scrape to client testing page
exports.test = function(req, res) {
  var recipe_page = req.body.recipe_page;
  var selector = req.body.selector;
  request(recipe_page, function(err, response, body) {
    if(!err && response.statusCode==200){
      var $ = cheerio.load(body);
      var recipe_text = $(selector).text().replace(/^\s+|\s+$/g, '');
      res.send(recipe_text);
    }
  });
};

// Searches Fork2Food's API
exports.getRecipes = function(req, res) {
  var url = 'http://food2fork.com/api/search?' + querystring.stringify({
    key:f2fkey,
    q: req.body.search
  });
  Source.find({}, function(err, resultArr) {
    var stored_urls = [];
    var stored_pending = [];
    resultArr.forEach(function(item) {
      stored_urls.push(item.url);
      stored_pending.push(item.pending);
    });
    request(url, function(err, response, body) {
      var data = JSON.parse(body);
      var titles = [];
      data.recipes.forEach(function(item){
          var fixed_url = fixUrl(item.source_url);
          var domain = fixed_url.substring(0, fixed_url.substring(8).indexOf('/')+8);
          var arr_index = stored_urls.indexOf(domain);
          if(arr_index===-1) {
            var new_entry = new Source({
              name:domain,
              url:domain,
              recipe_page:fixed_url,
              pending:true
            });
            new_entry.save();
            stored_urls.push(domain);
            stored_pending.push(true);
          } else if(!stored_pending[arr_index]){
            titles.push({'name': item.title, 'url': fixed_url});
          }
      });
      for(var i=0, len=titles.length; i<len;i++) {
        tagRecipe(titles[i].url);
      }
      res.send(titles);
    });

  });
};

// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
function tagRecipe(url) {
  // var url = req.body.url;
  var fixed_url = fixUrl(url);
  var domain = fixed_url.substring(0, fixed_url.substring(8).indexOf('/')+8);
  Source.findOne({url:domain}, function(err, item) {
    var selector = item.selector;
    request(url, function(err, response, body) {
      if(err) {
        console.log("Scrape Error: " + err);
      }
      else if(!err && response.statusCode==200){
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
      if(!!unique_words){
        console.log("Number of unique words: " + unique_words.length);
      }
      var lookup_count=0;





      
      var recursiveWordLoop = function(index) {
        if(index>=len) {
          console.log("END");
          console.log("Looked up " + String(Math.round(100*lookup_count/index)) + "% of words");
          return true;
        } else if(!!unique_words[index]) {
          console.log(index+1);
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
          console.log(index+1);
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


// Saves Source data in seed file as backup
exports.makeSeed = function(req, res) {
  var text = [];
  //   "var Source = require('../../api/source/source.model');\n\n",
  //   "Source.find({}).remove(function() {\n",
  //   "Source.create("
  // ];
  Source.find({}, function(err, sourceArr) {
    if(err) {
      console.log("ERROR GENERATING SOURCE SEED FILE!");
    } else {
      for(var i=0, len=sourceArr.length; i<len;i++) {
        text.push(JSON.stringify(sourceArr[i]));
        if(i<len-1) {
          text.push(", \n");
        }
      }
      // text.push("\n);\n});");
    }
    var final_text = text.join("");
    console.log("Current directory:", process.cwd());
    fs.writeFile('server/config/backup_seeds/source_seed.js', final_text, function(err){
      if(err){
        console.log(err);
      } else {
        res.send("Seed made");
      }
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}