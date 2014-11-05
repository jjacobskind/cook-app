'use strict';
var Snowball = require('snowball');
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
	base_word: { type: String, required: true },
	display_word: {
					type: String, 
					required: true,
					set: function(word) {
						var stemmer = new Snowball('English');
						stemmer.setCurrent(word);
						stemmer.stem();
						this.base_word = stemmer.getCurrent();
						return word;
					}
				},
	recipes: [RecipeSchema],
	category: String
});

var RecipeSchema = new Schema({
	name: {type: String, required: true},
	recipe_text: {type: String, required: true},
	stemmed_words: {type: [String], required: true},
	url: {type: String, required: true},
	source: {type: String, required: true},
	tags: [{type: mongoose.Schema.ObjectId, ref: 'Tag'}],
	date_tagged: {type: String, required:true},
	author: String
});

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