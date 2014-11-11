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
		this.blurb="";
		this.overview="";
		this.new_tip="";
		this.tips=[];
		this.skill;
		$scope.recipeList=[];
		if(!!type){
			skillTagFactory.setSkill(type, function(returned_skill){
				self.skill=returned_skill;
				self.blurb = returned_skill.page.blurb;
				self.overview = returned_skill.page.overview;
				if(!!returned_skill.page.tips) {
					self.tips = returned_skill.page.tips;
				}
				console.log(returned_skill);
				$scope.recipeList = returned_skill.recipes;
			});
		} else {
			$state.go('profile');
		}
	});