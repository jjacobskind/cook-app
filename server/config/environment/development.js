'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGOHQ_URL ||
    	'mongodb://localhost/generator-dev'
  },

  seedDB: true
};
