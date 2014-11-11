'use strict';

angular.module('cookApp')
	.config(function($stateProvider) {
		$stateProvider
			.state('skill', {
				url:'/skill/:type',
				templateUrl: 'app/skill/skill.html',
				controller:'SkillCtrl as skill_ctrl'
			})
			.state('edit_skill', {
				url:'/skill/edit/:type',
				templateUrl: 'app/skill/skill-edit/skill_edit.html',
				controller:'SkillEditCtrl as skill_edit_ctrl'
			});
		});