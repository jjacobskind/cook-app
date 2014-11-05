'use strict';

angular.module('generatorApp')
	.factory('ProfileMenu', function(){
		var menu = [
			{
				'title': 'Favorite Recipes',
				'state': 'favorite'
			},
			{
				'title': 'Recommendations',
				'state': 'recommendations'
			},
			{
				'title': 'Recent Meals',
				'state': 'Recent'
			},
			{
				'title': 'Contacts',
				'state': 'contacts'
			}
		];
		return menu;
	})
	.controller('ProfileCtrl', function($scope, User, ProfileMenu) {
		$scope.user = User.get();
		$scope.menu = ProfileMenu;
	});