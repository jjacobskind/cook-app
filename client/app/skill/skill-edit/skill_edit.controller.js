'use strict';

angular.module('cookApp')
	.controller('SkillEditCtrl', function($scope, $stateParams, $state, skillTagFactory) {
		var type = $stateParams.type;
		var self = this;
		this.skill;
		if(!!skillTagFactory.getSkill()){
			this.skill=skillTagFactory.getSkill();
		} else if(!!type) {
			skillTagFactory.setSkill(type, function(skill){
				self.skill = skill;
			});
		} else {
			$state.go('profile');
		}
	});