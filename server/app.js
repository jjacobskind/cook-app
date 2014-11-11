/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var search = require('./api/source/search');
// var redis = require('redis');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Socket IO set up
var io = require('socket.io').listen(server);

// Socket.io Communication
// var client = redis.createClient();
io.sockets.on('connection', function(socket){
	console.log("connected");
	search.initSearchSocket(io);
	socket.emit('send:socketId', {
		id: socket.id
	});
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;