'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SourceSchema = new Schema({
  name: {type: String, required:true},
  url: {type: String, required:true},
  selector: {type: String, required:true},
  recipe_page: String
});

module.exports = mongoose.model('Source', SourceSchema);