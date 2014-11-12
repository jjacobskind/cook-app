'use strict';

angular.module('cookApp')
	.factory('recipeFactory', function(Recipe){
		var recipe;
		this.skill_capitalized_display_word;
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
	.controller('recipeCtrl', function($stateParams, $http, recipeFactory, userFactory) {
		var self = this;
		var type = $stateParams.type;
		this.favorited;
		this.recipe;
		this.user;
		recipeFactory.setRecipe(type, function(returned_recipe){
			self.recipe=returned_recipe;
			self.user = userFactory.getUser();
			if(!!self.user.favorite_recipes && self.user.favorite_recipes.indexOf(self.recipe._id)!==-1){
				self.favorited=true;
			} else {
				self.favorited=false;
			}
		});

		this.showSkill = function(skill_obj){
			self.skill_capitalized_display_word = skill_obj.display_word[0].toUpperCase() + skill_obj.display_word.substring(1);
			self.selected_skill=skill_obj;
			
		};

		this.toggleFavorite = function(){
			if(!!self.user.favorite_recipes && self.user.favorite_recipes.indexOf(self.recipe._id)!==-1){
				var add=false;
			} else {
				add=true;
			}
			var obj = {
				add: add,
				recipe_id: self.recipe._id
			};
			$http.post('/api/users/favorites', obj)
				.success(function(user_obj){
					userFactory.setUser(user_obj);
					self.user = user_obj;
					if(user_obj.favorite_recipes.indexOf(self.recipe._id)!==-1){
						self.favorited=true;
					} else {
						self.favorited=false;
					}
				});
		};
	});