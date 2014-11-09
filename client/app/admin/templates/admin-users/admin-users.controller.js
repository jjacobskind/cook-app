'use strict';

angular.module('cookApp')
	.controller('AdminUserCtrl', function($scope, $http, User){
		$scope.users = User.query();
		$scope.toggleHalfDelete = function(obj){
			var index = $scope.users.indexOf(obj);
			if($scope.users[index].half_deleted === true){
				$scope.users[index].half_deleted=false;
			} else {
				$scope.users[index].half_deleted=true;
			}
		};
		$scope.deleteUser = function(obj){
			$http.delete('/api/users/'+obj._id)
				.success(function(err, res){
					if(!err){
						var index = $scope.users.indexOf(obj);
						$scope.users.splice(index, 1);
					}
				});
		}
	});