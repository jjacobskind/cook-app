'use strict';

angular.module('generatorApp')
	.controller('OnboardCtrl', function($scope, $http, User, Tag){
		$scope.skill="";
		$scope.user = User.get();
		$scope.suggestions=[];
		var skill_tags = Tag.query();
		$scope.selected_skills = [];
		$scope.autoComplete = function() {
			$scope.suggestions=[];
			if($scope.skill.length>0) {
				var entry_len = $scope.skill.length;
				var i = skill_tags.length;
				console.log(skill_tags);
				while((i--) && ($scope.suggestions.length<20)) {
					if(skill_tags[i].display_word.substring(0,entry_len)===$scope.skill){
						$scope.suggestions.push(skill_tags[i]);
					}
				}
			}
		};
		$scope.toggleSkill = function(skill_obj) {
			var index = $scope.selected_skills.indexOf(skill_obj);
			var tags_index = skill_tags.indexOf(skill_obj);
			var post_obj = { 
					skill_tag: {
						skill_tag: skill_obj._id,
						skill_level: 0
					},
					id: $scope.user._id		
			};
			if(index===-1) {
				$scope.selected_skills.push(skill_obj);
				skill_tags[tags_index].picked=true;
				post_obj.add=true;
			} else {
				$scope.selected_skills.splice(index,1);
				skill_tags[tags_index].picked=false;
				post_obj.add=false;
			}

			$http.post('/api/users/tags', post_obj)
				.success(function(res){
					console.log(res);
				});
		};
	});