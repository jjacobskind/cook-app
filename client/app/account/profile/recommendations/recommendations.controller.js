'use strict';

angular.module('generatorApp')
	.controller('RecommendedRecipesCtrl', function($scope, $http){
		$scope.awesomeThings = [];
		$scope.search_text = "chicken";
		$scope.getRecipes = function() {
		  $http.post('/api/sources/get_recipes', {search: $scope.search_text})
		    .success(function(recipe_list) {
		      $scope.awesomeThings = recipe_list;
		    });
		};
		$scope.getRecipes();
	});