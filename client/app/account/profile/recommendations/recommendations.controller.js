'use strict';

angular.module('generatorApp')
	.controller('RecommendedRecipesCtrl', function($scope, $http, Auth){
		$scope.awesomeThings = [];
		$scope.id = Auth.getCurrentUser()._id;
		$scope.getRecipes = function() {
		  $http.get('/api/sources/get_recipes/' + $scope.id, {search: $scope.search_text})
		    .success(function(recipe_list) {
		      $scope.awesomeThings = recipe_list;
		    });
		};
		$scope.getRecipes();
	});