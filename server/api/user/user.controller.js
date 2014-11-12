'use strict';

var User = require('./user.model');
var Tag = require('../source/source.model').tag;
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var async = require('async');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    user.populateSkills(function(err,pop_user) {
      res.json(pop_user);
    });
  });
};

// Adds or removes skill tags from the user's account
exports.changeTags = function(req, res) {
  var skill = req.body.skill;
  var id = req.body.id;
  User.findById(id, function(err, user){
    var i=user.skills.length;
    var index=-1;
    while(i--){
      if(String(user.skills[i].skill_tag) == String(skill.skill_tag)){
        index=i;
      }
    }
    if(req.body.add && index===-1) {
      user.skills.push(skill);
      user.save();
    } 
    else if(index!==-1) {
      user.skills.splice(index,1);
      user.save();
    }
    res.json({message: "finished"});
  });
};


exports.changeFavorites = function(req, res){
  var user_id = req.user._id;
  var recipe_id = req.body.recipe_id;
  User.findById(user_id, function(err, user){
    var user_favorite_index = user.favorite_recipes.indexOf(recipe_id);
    if(req.body.add && user_favorite_index===-1){
      user.favorite_recipes.push(recipe_id);
      user.save();
    }
    else if(!req.body.add && user_favorite_index!==-1){
      user.favorite_recipes.splice(user_favorite_index, 1);
      user.save();
    }
    res.json(user);
  });
},

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};