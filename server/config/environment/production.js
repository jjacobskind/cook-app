'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/generator'
  },

  //Fork2Food API Key
  f2fkey: process.env.F2FAPIKEY,

  // Merriam-Webster Dictionary API Key
  mwdictkey: process.env.MWDICTAPIKEY,

  // Merriam-Webster Thesauraus API Key
  mwtheskey: process.env.MWTHESAPIKEY
};