/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var f2fkey = require('../../config/environment/production').f2fkey;
var querystring = require('querystring');
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');

//  list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.getRecipes = function(req, res) {
  var url = 'http://food2fork.com/api/search?' + querystring.stringify({
    key:f2fkey,
    q: req.body.search
  });

  // Searches Fork2Food's API
  request(url, function(err, response, body) {
    var data = JSON.parse(body);
    var titles = data.recipes.map(function(item){
        return {'name': item.title, 'url': item.source_url};
    });
    res.send(titles);
  });
};

// Scrapes recipe from source, auto-tags it by F2F ID, and saves entry in DB
exports.tagRecipe = function(req, res) {
  var url = req.body.url;
  request(url, function(err, response, body) {
    if(!err && response.statusCode==200){
      var $ = cheerio.load(body);
      console.log($("ol.instructions").text());
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}