'use strict';

angular.module('cookApp')
	.controller('SkillCtrl', function($scope, $stateParams, Tag) {
		var type = $stateParams.type;
		$scope.awesomeThings;
		$scope.skill = Tag.get({id:type}, function(){
			$scope.skill.display_word = $scope.skill.display_word[0].toUpperCase() + $scope.skill.display_word.substring(1);
			$scope.awesomeThings = $scope.skill.recipes;
		});
	});