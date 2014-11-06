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
var Snowball = require('snowball');
var Q = require('q');
var search = require('./search');
// var socket = require('socket.io')();

var all_results_tagged = 0;   //keeps count of how many of the asycn functions have finished tagging
var all_results = [];   //contains all results tagged by parallel tagRecipe instances

// Get list of sources
exports.index = function(req, res) {
  res.send("Empty!");
};

exports.getSelectors = function(req, res) {
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
exports.updateOrCreateSelector = function(req, res) {
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
    'key':f2fkey,
    'q': req.body.search
  });
  var search_info ={};


  // Loads array of domains that are already registered in selector tool
  // These arrays will be used to determine whether a result can be displayed
  // Or whether the domain should be added to the selector tool
  Source.find({}).exec()
    .then(search.getDomains)
    .then(function(ret_info){
      search_info = ret_info;
      search_info.cur_url = url;
      return search_info;
    })
    .then(function(search_info){
      Q.nfcall(request, search_info.cur_url)
        .then(function(res){
          search_info.titles = search.searchRecipes(search_info, res[0].body);
          return search_info;
        })
        .then(function(search_info){
          Tag.find({}).exec()
            .then(function(tagArr){
              var i=tagArr.length;
              var base_tags = [];
              var display_tags = [];
              while(i--) {
                base_tags.push(tagArr[i].base_word);
                display_tags.push(tagArr[i].display_word);
              }
              for(var i=0, len=search_info.titles.length; i<len;i++) {
                tagRecipe(search_info.titles[i].url, tagArr, search_info.titles[i].name, "f2f");
              }
              all_results_tagged = 0;
              all_results = [];
              var total = search_info.titles.length;
              var tag_waiting = setInterval(function() {
                if(all_results_tagged === total) {
                  clearInterval(tag_waiting);
                  res.send(all_results);
                }
              }, 100);
            });
        })
        .fail(function(err){ console.log(err); });
    });
};

// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
function tagRecipe(url, tagArr, name, source) {
  // var url = req.body.url;
  var fixed_url = search.fixUrl(url);
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
      var lookup_count=0;
      var stemmer = new Snowball('English');
      var recipe_text = [];
      var matched_tags=[];
      var base_tags = [];
      var tag_ids = [];
      var display_tags = [];
      var matched_ids = [];
      i=tagArr.length;
      while(i--) {
        base_tags.push(tagArr[i].base_word);
        tag_ids.push(tagArr[i]._id);
        display_tags.push(tagArr[i]._id);
      }
      if(!unique_words) {
        var len=0;
      }
      else{
        len=unique_words.length;
      }
      for(var i=0; i<len; i++) {
        stemmer.setCurrent(unique_words[i]);
        stemmer.stem();
        var stemmed_word = stemmer.getCurrent();
        recipe_text.push(stemmed_word);
        var base_index = base_tags.indexOf(stemmed_word);
        if((base_index!==-1) && (matched_tags.indexOf(display_tags[base_index])===-1)) {
          matched_tags.push(display_tags[base_index]);
          matched_ids.push(tag_ids[base_index]);
        }
      }
      if(matched_tags.length>0) {
        Recipe.findOne({'url': url}, function(err, entry){
          if(err) {
            console.log("ERROR: Post Tag Matching: " + err);
          }
          else if(!entry) {
            var d = new Date();
            var new_recipe = new Recipe({
                'name': name,
                'recipe_text': text.join(" "),
                'stemmed_words': recipe_text,
                'source': source,
                'url': url,
                'tags': matched_ids,
                'date_tagged': String(d.getFullYear() + " " + d.getMonth() + " " + d.getDate())
            });
            new_recipe.save(function(err_alpha, saved_item){
              saved_item.populate('tags', function(err_beta, populated_entry){
                all_results.push(populated_entry);
              });
            });  //NEED TO GET THE STORED ITEM BACK FROM MONGO!!!!
            all_results.push(d);
          } else {
            // TAG IDS GET POPULATED HERE
            entry.populate('tags', function(err, populated_entry){
              all_results.push(populated_entry);
            })
          }
          all_results_tagged++;
          console.log(all_results_tagged);
        })
      } else {
        all_results_tagged++;
      }
    });
  });
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

// Returns an of all tags
exports.getTags = function(req, res) {
  Tag.find({}, function(err, tagArr) {
    if(err) { return handleError(res, err); }
    return res.json(200, tagArr);
  });
};

// Creates a new tag or updates an existing tag
exports.updateOrCreateTag = function(req, res) {
  var obj = req.body;
  var stemmer = new Snowball('English');
  stemmer.setCurrent(obj.display_word);
  stemmer.stem();
  obj.base_word = stemmer.getCurrent();
  Tag.findOneAndUpdate({display_word:obj.display_word}, obj, function(err, tag) {
    if(err) { 
      return handleError(res, err); 
    } 
    else if(tag===null) {
      var new_tag = new Tag(obj);
      new_tag.save(function(errNewSave){
        if(errNewSave) {
          handleError(res, errNewSave);
        }
        else {
          Tag.find({}, function(errFindAll, tagArr){
            if(errFindAll) { return handleError(res, errFindAll); }
            return res.json(200, {'array': tagArr});
          });
        }
      });
    } else {
      Tag.find({}, function(errFindAll, tagArr){
        if(errFindAll) { return handleError(res, errFindAll); }
        return res.json(200, {'array': tagArr});
      });
    }
  });
};

exports.destroyTag = function(req, res) {
  Tag.findById(req.params.id, function (err, tag) {
    if(err) { return handleError(res, err); }
    if(!tag) { return res.send(404); }
    tag.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}