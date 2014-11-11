'use strict';

angular.module('cookApp')
	.factory('recipeFactory', function(Recipe){
		var recipe;
		var self = this;
		return {
			setRecipe: function(id, cb){
				Recipe.get({'id':id}, function(returned_recipe){
					self.recipe=returned_recipe;
					cb(returned_recipe);
				});
			},
			getRecipe: function() {
				return self.recipe;
			}
		};
	})
	.controller('recipeCtrl', function($stateParams, recipeFactory) {
		var type = $stateParams.type;
		this.recipe;
		var self = this;
		recipeFactory.setRecipe(type, function(returned_recipe){
			self.recipe=returned_recipe;
			console.log(returned_recipe);
		});
	});