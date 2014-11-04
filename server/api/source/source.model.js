'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SourceSchema = new Schema({
  name: {type: String, required:true},
  url: {type: String, required:true},
  selector: String,
  recipe_page: String,
  pending: {type: Boolean, required:true}
});

var TagSchema = new Schema({
	base_word: {type: String, required: true},
	display_word: {type: String, required: true},
	recipes: [RecipeSchema],
	category: String
});

var RecipeSchema = new Schema({
	name: {type: String, required: true},
	recipe_text: {type: String, required: true},
	recipe_base_words: {type: [String], required: true},
	index: {type: String, required: true},
	source_url: {type: String, required: true},
	tags: [TagSchema]
});

/*
	RecipeSchema Index Scheme:
		114: prefix tag for recipes obtained from Food2Fork
*/

var WordSchema = new Schema({
	word: {type: String, required: true},
	base: {type: String, required: true}
});

module.exports = {
	source: mongoose.model('Source', SourceSchema),
	tag: mongoose.model('Tag', TagSchema),
	recipe: mongoose.model('Recipe', RecipeSchema),
	word: mongoose.model('Word', WordSchema)
};