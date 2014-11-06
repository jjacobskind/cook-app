'use strict';

var request = require('request');

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


//Gets rid of the www in a url
exports.fixUrl = function(url) {
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