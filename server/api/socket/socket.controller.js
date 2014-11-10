/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';


module.exports = function (socket) {
	socket.emit('send:time', {
		time: (socket.id).toString()
	});
};

// function handleError(res, err) {
//   return res.send(500, err);
// }