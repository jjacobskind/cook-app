'use strict';

var _ = require('lodash');
var request = require('request');
var Source = require('./source.model').source;
var Tag = require('./source.model').tag;
var Recipe = require('./source.model').recipe;
var cheerio = require('cheerio');
var Snowball = require('snowball');

var all_results_tagged = 0;
var all_results = [];

exports.getDomains = function(resultArr) {  
    var stored_urls = [];
    var stored_pendings = [];

    resultArr.forEach(function(item) {
      stored_urls.push(item.url);
      stored_pendings.push(item.pending);
    });
    return {urls: stored_urls, pendings: stored_pendings};
};

exports.searchRecipes = function(search_info, body) {
	var data = JSON.parse(body);
	var titles = [];
	data.recipes.forEach(function(item){
	  var fixed_url = exports.fixUrl(item.source_url);
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

	// Resets tracking arrays and calls tagRecipe on each recipe
	all_results_tagged = 0;
	all_results = [];
	for(var i=0, len=search_info.titles.length; i<len;i++) {
		exports.tagRecipe(search_info.titles[i].url, tagArr, search_info.titles[i].name, "f2f");
	}
	var total = search_info.titles.length;
	var tag_waiting = setInterval(function() {
		if(all_results_tagged === total) {
		  clearInterval(tag_waiting);
		  res.send(all_results);
		}
	}, 100);
};


// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
exports.tagRecipe = function(url, tagArr, name, source) {
  var fixed_url = exports.fixUrl(url);
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
  // console.log(fixed_url);
  return fixed_url;
};