'use strict';

angular.module('cookApp')
	.controller('SkillCtrl', function($scope, $stateParams, Tag) {
		var type = $stateParams.type;
		var self = this;
		this.skill = Tag.get({id:type}, function(){
			self.skill.display_word = self.skill.display_word[0].toUpperCase() + self.skill.display_word.substring(1);
			self.recipeList = self.skill.recipes;
		});
	});