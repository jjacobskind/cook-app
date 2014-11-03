'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

var WordSchema = new Schema({
	word: {type: String, required: true},
	base: {type: String, required: true}
});

module.exports = {
	recipe: mongoose.model('Recipe', RecipeSchema),
	word: mongoose.model('Word', WordSchema)
};