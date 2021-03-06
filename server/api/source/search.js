'use strict';

var _ = require('lodash');
var request = require('request');
var Source = require('./source.model').source;
var User = require('../user/user.model');
var Tag = require('./source.model').tag;
var Recipe = require('./source.model').recipe;
var cheerio = require('cheerio');
var Snowball = require('snowball');
var async = require('async');
var Q = require('q');
var querystring = require('querystring');
var f2fkey = require('../../config/environment/production').f2fkey;
var Entities = require('html-entities').AllHtmlEntities;
var io;
var socketId;

exports.startSearch = function(res, search_terms, unique_terms, id, socketId_param, recommended) {
  socketId = socketId_param;

  var search_info ={};
  // Get user's skills
  User.findById(id).exec()
    .then(function(user){
      if(!recommended){
        user.addSearchTerms(unique_terms);
      }
      return user.skills.map(function(item){
        return String(item.skill_tag);
      })
    })
    .then(function(user_skills){

      // Filter recipe results by user's skills
      Recipe.find({tags: {$in: user_skills} }).exec()
        .then(function(recipes){
          var filtered_recipes = recipes.filter(function(item){
            var i = item.tags.length;
            while(i--){
              if(user_skills.indexOf(String(item.tags[i]))===-1) {
                return false;
              }
            }
            return true;
          });
          return filtered_recipes;
        })

        // Filter remaining results by search terms
        .then(function(filtered_recipes){
          return filtered_recipes.filter(function(item){
            var i = item.stemmed_words.length;
            while(i--){
              if(unique_terms.indexOf(String(item.stemmed_words[i]))!==-1) {
                return true;
              }
            }
            return false;
          });
        })

          // Create an object containing an array of populate functions
          // And an array for results to be pushed into
        .then(function(completely_filtered_recipes){
          var pop_obj = {functions:[], values:[]};
          pop_obj.functions = completely_filtered_recipes.map(function(item){
            var this_func =  function(cb){
              item.populate('tags', function(err1, populated_item){
                pop_obj.values.push(populated_item);
                cb();
              });
            };
            return this_func;
          });
          return pop_obj;
        })

        // populate the recipe result skill tags
        .then(function(pop_obj) {
          Q.nfcall(async.parallel, pop_obj.functions)
            .then(function(){
                res.send(pop_obj.values);
            });
        })
    });

  // Loads array of domains that are already registered in selector tool
  // These arrays will be used to determine whether a result can be displayed
  // Or whether the domain should be added to the selector tool
  Source.find({}).exec()

    // Add two arrays to search_info
    // First array contains the domain url
    // Second array contains a boolean value indicating whether a selector has been picked
    .then(exports.getDomains)

    // Make multiple simultaneous API requests to Food2Fork
    // Add a 'titles' array to search_info
      // Each array element consists of an object containing 
      // the name and full URL of each recipe returned
    .then(function(search_info){
      var api_calls = [];
      var urls = [];
      var search_results = { recipes:[] };
      var max = 2;
      for(var i=1;i<=max;i++){
        var url = String('http://food2fork.com/api/search?' + querystring.stringify({
          'key':f2fkey,
          'q': search_terms,
          'page': i
        }));
        urls.push(url);
      }

      api_calls = urls.map(function(item){
        return (function(cb){
          request(item, function(err, response, body){
            var data = JSON.parse(body);
            search_results.recipes = search_results.recipes.concat(data.recipes);
            cb();
          });
        });
      });

      Q.nfcall(async.parallel, api_calls)
      .then(function(){
        return search_results;
      })

      .then(function(api_res){
        Recipe.find({}).exec()
          .then(function(all_local_recipes){
            return all_local_recipes.map(function(item){
              return item.url;
            });
          })
          .then(function(locally_stored_urls){
            search_info.titles = exports.searchRecipes(search_info, api_res, locally_stored_urls);
            return search_info;
          })
          // Queries database for all skill tags
          // Populates base_tags with array of all base words for tags
          // Populates display_tags with array of all display words for tags
          // Arrays are populated simultaneously, so indices match
          .then(function(search_info){
            Tag.find({}).exec()
              .then(function(tagArr){
                exports.getTags(tagArr, res, search_info);
              });
          })
          .fail(function(err){ console.log(err); });
      })

    });
};


exports.getDomains = function(resultArr) {  
    var stored_urls = [];
    var stored_pendings = [];

    resultArr.forEach(function(item) {
      stored_urls.push(item.url);
      stored_pendings.push(item.pending);
    });
    return {urls: stored_urls, pendings: stored_pendings};
};

exports.searchRecipes = function(search_info, data, locally_stored_urls) {
	var titles = [];
  data.recipes.forEach(function(item){
    var fixed_url = exports.fixUrl(item.source_url); 
    if(locally_stored_urls.indexOf(fixed_url)===-1) {
  	  var domain = fixed_url.substring(0, fixed_url.substring(8).indexOf('/')+8);
  	  var arr_index = search_info.urls.indexOf(domain);
  	  
  	  // If domain is not in selector tool, add it
  	  if(arr_index===-1) {
  	    var new_entry = new Source({
  	      name:domain,
  	      url:domain,
  	      recipe_page:fixed_url,
  	      pending:true
  	    });
  	    new_entry.save();
  	    search_info.urls.push(domain);
  	    search_info.pendings.push(true);

  	    // If domain already has a selector picked, push recipe onto array for tagging/potential display
  	  } else if(!search_info.pendings[arr_index]){
  	    titles.push({'name': item.title, 'url': fixed_url});
  	  }
    }
	});
	return titles;
};


exports.getTags = function(tagArr, res, search_info){
	var i=tagArr.length;
	var base_tags = [];
	var display_tags = [];
	while(i--) {
		base_tags.push(tagArr[i].base_word);
		display_tags.push(tagArr[i].display_word);
	}


  var total = search_info.titles.length;
  // Resets tracking arrays and calls tagRecipe on each recipe
  for(var i=0, len=search_info.titles.length; i<len;i++) {
    exports.tagRecipe(search_info.titles[i].url, tagArr, search_info.titles[i].name, "f2f");
  }
};

exports.wordProcess = function(text){
  return text.replace(/[\.,\/#!$%\^&\*;:{}=_`~()0-9]/g,"")
          .replace(/[\t\n]/g," ")
          .replace(/\s{2,}/g," ")
          .toLowerCase()
          .split(" ");
};

// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
exports.tagRecipe = function(url, tagArr, name, source) {
  
  var fixed_url = exports.fixUrl(url);
  var domain = fixed_url.substring(0, fixed_url.substring(8).indexOf('/')+8);

  Source.findOne({url:domain}, function(err, item) {
    var selector = item.selector;
    request(url, function(err, response, body) {

      if(err) {
        console.log("Scrape Error: " + err +"|");
      }
      else if(!err && response.statusCode==200){
        var $ = cheerio.load(body);
        var original_text = $(selector).text();
        var text = exports.wordProcess(original_text);
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
            var entities = new Entities();
            name = entities.decode(name)
                    .split(" ")
                    .map(function(item) {
                      item = item.toLowerCase();
                      if(item==='and' || item==='by'){
                        return item;
                      } else {
                        return item[0].toUpperCase() + item.substring(1);
                      }
                    })
                    .join(" ");
            var new_recipe = new Recipe({
                'name': name,
                'recipe_text': original_text.trim(),
                'stemmed_words': recipe_text,
                'source': source,
                'url': url,
                'tags': matched_ids,
                'date_tagged': String(d.getFullYear() + " " + d.getMonth() + " " + d.getDate())
            });
            new_recipe.save(function(err_alpha, saved_item){
              saved_item.populate('tags', function(err_beta, populated_entry){
                socketResults(populated_entry);

                // Add recipe ID to its matching skill tags
                var parallelTasks = matched_ids.map(function(item){
                  return function(callback) {
                    Tag.findById(item, function(err, skill_tag){
                      if(skill_tag.recipes.indexOf(saved_item._id)===-1){
                        skill_tag.recipes.push(saved_item._id);
                        skill_tag.save();
                      }
                      callback();
                    });
                  };
                });
                async.parallel(parallelTasks, function(){
                  console.log("Recipes tagged in skill document");
                });
              });
            });
          } else {
            // TAG IDS GET POPULATED HERE
            entry.populate('tags', function(err, populated_entry){
              socketResults(populated_entry);
            });
          }
        })
      }
    });
  });
};


//Gets rid of the www in a url
exports.fixUrl =function(url) {
  if(url.substring(0,5) === "www.") {
    var fixed_url = "http://" + url.substring(4);
  }
  else if(url.substring(0,11)==="http://www.") {
    fixed_url = "http://" + url.substring(11);
  }
  else {
    fixed_url=url;
  }
  return fixed_url;
};

exports.initSearchSocket = function(socket){
  io=socket;
};

var socketResults = function(recipe){
  io.sockets.connected[socketId].emit('send:results', {
    recipe: recipe
  });
};