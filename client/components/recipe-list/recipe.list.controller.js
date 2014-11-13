'use strict';

angular.module('cookApp')
	.factory('recipelistFactory', function($rootScope){
		var recipeList = [];
		var api_recipes=[];
		return {
			getRecipes: function(){
				return recipeList;
			},
			setRecipes: function(recipeArr) {
				recipeList = recipeArr;
				$rootScope.$broadcast('recipesIn');
			},
			addApiRecipe: function(recipeObj){
				api_recipes.push(recipeObj);
				$rootScope.$broadcast('apiRecipesIn');
			},
			getApiRecipes: function(){
				var return_arr = api_recipes;
				api_recipes = [];
				return return_arr;
			}

		}
	})
	.controller('RecipelistCtrl', function($scope, recipelistFactory){
		var self = this;
		self.all_recipes = [];
		self.visibleRecipes = [];
		self.listIndex = 1;
		self.recipeCount = 0;

		// ADD IN LOGIC FOR DISPLAYING LIST IF THERE ARE FEWER THAN 10 RESULTS!

		$scope.$on('recipesIn', function(){
			self.all_recipes = recipelistFactory.getRecipes();
			self.recipeCount = self.all_recipes.length;
			if(self.all_recipes.length>=10){
				self.visibleRecipes = self.all_recipes.slice(0,10);
			}
		});

		$scope.$on('apiRecipesIn', function(){
			var len = self.all_recipes.length;
			self.all_recipes = self.all_recipes.concat(recipelistFactory.getApiRecipes());
			self.recipeCount = self.all_recipes.length;
			if(len <10 && self.all_recipes.length>=10){
				self.visibleRecipes = self.all_recipes.slice(0,10);
			}
		});

		this.traverseResults = function(direction){
		  switch(direction){
		    case "next":
		      self.listIndex++;
		      break;
		    case "prev":
		      self.listIndex--;
		      break;
		  }
		  self.visibleRecipes = self.all_recipes.slice(((self.listIndex-1)*10), self.listIndex*10);
		}

	});