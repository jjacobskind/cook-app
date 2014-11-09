'use strict';

angular.module('cookApp')
	.controller('SkillEditCtrl', function($scope, $stateParams, Tag) {
		var type = $stateParams.type;
		$scope.skill = Tag.get({id:type}, function(){
			$scope.skill.display_word = $scope.skill.display_word[0].toUpperCase() + $scope.skill.display_word.substring(1);
		});
	});