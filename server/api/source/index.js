'use strict';

var express = require('express');
var controller = require('./source.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
// router.get('/:id', controller.show);
router.post('/test', controller.test);
// router.put('/:id', controller.update);
router.patch('/:id', controller.update);

// Selector functions
router.get('/selectors', controller.getSelectors);
router.post('/selectors', auth.hasRole('admin'), controller.updateOrCreateSelector);
router.delete('/selectors/:id', controller.destroy);

// Recipe functions
router.get('/recipes/:id', auth.isAuthenticated(), controller.getOneRecipe);
router.post('/get_recipes', controller.getRecipes);
router.post('/get_recipes/recommended', auth.isAuthenticated(), controller.recommendedSearch);

router.get('/tags', controller.getTags);
router.get('/tags/:id', controller.show);
router.post('/tags', controller.updateOrCreateTag);
router.post('/tags/pageUpdate', auth.hasRole('user'), controller.editSkillPage);
router.post('/tags/suggest', auth.hasRole('user'), controller.suggestTag);
router.delete('/tags/:id', controller.destroyTag);

module.exports = router;