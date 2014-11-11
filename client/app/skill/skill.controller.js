'use strict';

angular.module('cookApp')
	.factory('skillTagFactory', function(Tag){
		var skill;
		return {
			getSkill: function(){
				return skill;
			},
			setSkill: function(type, cb){
				Tag.get({id:type}, function(returned_skill){
					returned_skill.display_word = returned_skill.display_word[0].toUpperCase() + returned_skill.display_word.substring(1);
					skill=returned_skill;
					cb(returned_skill);
				});
			}
		};
	})
	.controller('SkillCtrl', function($scope, $stateParams, $state, skillTagFactory) {
		var type = $stateParams.type;
		var self = this;
		if(!!type){
			skillTagFactory.setSkill(type, function(returned_skill){
				self.skill=returned_skill;
				$scope.recipeList = returned_skill.recipes;
			});
		} else {
			$state.go('profile');
		}
	});