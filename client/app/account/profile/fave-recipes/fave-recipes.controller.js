'use strict';

angular.module('cookApp')
	.controller('FavRecipesCtrl', function($scope, userFactory){
		var user = userFactory.getUser();
		// if(!user.favorite_recipes){
		// 	$scope.recipeList=[]
		// } else {
		// 	$scope.recipeList = user.favorite_recipes;
		// }
		// console.log(user.favorite_recipes);
	});