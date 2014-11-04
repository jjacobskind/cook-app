'use strict';

angular.module('generatorApp')
	.controller('AdminTagsCtrl', function($scope, $http, Tag){
		$scope.tags = Tag.query();
        $scope.tag = {
            display_word:"",
            category:""
        };
        $scope.add = function() {
        	Tag.save({}, $scope.tag, function(res){
        		$scope.tags=res.array;
        		$scope.reset();
        	});
        };
        $scope.reset = function() {
        	$scope.tag.display_word="";
        	$scope.tag.base_word="";
        	$scope.tag.category="";
        };
        $scope.delete = function(id, tag) {
        	Tag.delete({"id":id}, function(res) {
        		var i = $scope.tags.indexOf(tag);
        		$scope.tags.splice(i,1);
        	});
        };
	});