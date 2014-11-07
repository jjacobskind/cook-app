'use strict';

angular.module('generatorApp')
	.controller('SkillEditCtrl', function($scope, $stateParams, Tag) {
		var type = $stateParams.type;
		$scope.skill = Tag.get({id:type});
	});