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
		this.selected_skill;
		recipeFactory.setRecipe(type, function(returned_recipe){
			self.recipe=returned_recipe;
		});

		this.showSkill = function(skill_obj){
			skill_obj.display_word = skill_obj.display_word[0].toUpperCase() + skill_obj.display_word.substring(1);
			self.selected_skill=skill_obj;
			
		};
	});