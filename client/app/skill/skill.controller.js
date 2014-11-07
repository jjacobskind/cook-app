'use strict';

angular.module('generatorApp')
	.controller('SkillCtrl', function($scope, $stateParams, Tag) {
		var type = $stateParams.type;
		$scope.awesomeThings;
		$scope.skill = Tag.get({id:type}, function(){
			$scope.awesomeThings = $scope.skill.recipes;
			console.log($scope.skill.recipes);
		});
	});