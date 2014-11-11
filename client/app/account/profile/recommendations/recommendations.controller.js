'use strict';

angular.module('cookApp')
	.controller('RecommendedRecipesCtrl', function($scope, $http, $timeout, Auth, socket){
		var recipes = [];
		$scope.listIndex=1;
		$scope.recipeList = [];
		$scope.id = Auth.getCurrentUser()._id;
		 var getRecipes = function() {
		  $http.post('/api/sources/get_recipes/recommended', {id: $scope.id, socketId: socket.getId()})
		    .success(function(recipe_list) {
		    	recipes = recipes.concat(recipe_list);
		    	if(recipes.length>=10){
			    	$scope.recipeList = recipes.slice(0, 10);
		    	} else {
			    	$timeout(function(){
			    	  if(recipes.length<10){
			    	    $scope.recipeList=recipes;
			    	  }
			    	}, 2000);
			    }
		    })
		    .error(function(res){
		    	console.log(res);
		    });
		};

		socket.on('send:results', function (response) {
		  recipes.push(response.recipe);
		  $scope.recipeCount=recipes.length;
		  if(recipes.length>=10 && $scope.listIndex===1){
		    $scope.recipeList = recipes.slice(0,10);
		  }
		});
		getRecipes();
	});