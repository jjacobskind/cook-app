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

module.exports = mongoose.model('Source', SourceSchema);