'use strict';

angular.module('cookApp')
	.config(function($stateProvider){
		$stateProvider
			.state('recipe', {
				url:'/recipe/:type',
				templateUrl: 'app/recipe/recipe.html',
				controller: 'recipeCtrl as recipe_ctrl'
			})
	});