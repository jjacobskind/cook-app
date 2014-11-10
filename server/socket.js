// Socket IO set up

var socket;

var io = function(server) {
	socket = require('socket.io').listen(server);
	return socket;
};

module.exports = {
	initSocket: io,
	socket: socket
};