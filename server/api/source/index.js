'use strict';

var express = require('express');
var controller = require('./source.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
// router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.updateOrCreate);
router.post('/test', controller.test);
// router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/seed', auth.hasRole('admin'), controller.makeSeed);
router.post('/get_recipes', controller.getRecipes);

module.exports = router;