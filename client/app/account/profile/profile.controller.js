'use strict';

angular.module('cookApp')
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
		this.user = User.get();
		this.menu = ProfileMenu;
	});