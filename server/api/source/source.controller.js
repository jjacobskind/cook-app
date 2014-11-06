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

    // Create search_info object containing 2 arrays
    // First array contains the domain url
    // Second array contains a boolean value indicating whether a selector has been picked
    .then(search.getDomains)

    // Attach Food2Fork API URL containing search parameters
    .then(function(ret_info){
      search_info = ret_info;
      search_info.cur_url = url;
      return search_info;
    })

    // Add a 'titles' array to search_info
    // Each array element consists of an object containing the name and URL of a recipe
    .then(function(search_info){
      Q.nfcall(request, search_info.cur_url)
        .then(function(res){
          search_info.titles = search.searchRecipes(search_info, res[0].body);
          return search_info;
        })

        // Queries database for all skill tags
        // Populates base_tags with array of all base words for tags
        // Populates display_tags with array of all display words for tags
        // Arrays are populated simultaneously, so indices match
        .then(function(search_info){
          Tag.find({}).exec()
            .then(function(tagArr){
              search.getTags(tagArr, res, search_info);
            });
        })
        .fail(function(err){ console.log(err); });
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