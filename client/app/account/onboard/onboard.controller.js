'use strict';

angular.module('generatorApp')
	.controller('OnboardCtrl', function($scope, $http, User, Tag){
		$scope.skill="";
		$scope.user = User.get(function(){
			$scope.selected_skills = $scope.user.skills.map(function(item){
				return item.skill_tag;
			});
		});
		$scope.suggestions=[];
		var skill_tags;
		var load_tags = Tag.query(function(){
			var selected_ids = $scope.selected_skills.map(function(item){
				return item._id
			});
			skill_tags = load_tags.map(function(item){
				if(selected_ids.indexOf(item._id)!==-1) {
					item.picked=true;
				}
				return item;
			});
		});
		$scope.autoComplete = function() {
			$scope.suggestions=[];
			if($scope.skill.length>0) {
				var entry_len = $scope.skill.length;
				var i = skill_tags.length;
				while((i--) && ($scope.suggestions.length<20)) {
					if(skill_tags[i].display_word.substring(0,entry_len)===$scope.skill){
						$scope.suggestions.push(skill_tags[i]);
					}
				}
			}
		};
		$scope.toggleSkill = function(skill_obj) {
			var index = $scope.selected_skills.indexOf(skill_obj);
			var skill_id = skill_obj._id;
			var i=skill_tags.length;
			var tags_index=-1;
			while(i--) {
				if(skill_id===skill_tags[i]._id) {
					tags_index=i;
					break;
				}
			}
			var post_obj = { 
					skill_tag: {
						skill_tag: skill_id,
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