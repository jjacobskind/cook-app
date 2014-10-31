'use strict';

angular.module('generatorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        templateUrl: 'app/admin/admin.html'
      })

      .state('admin.scrape', {
		url: '/scrape',
    	templateUrl: 'app/admin/templates/admin-scrape.html',
    	controller: function($scope, $http, Source) {
    		$scope.sources = Source.query();
    		$scope.test = function() {
    			var obj = {
    				recipe_page: $scope.source.recipe_page,
    				selector: $scope.source.selector
    			};
    			$http.post('/api/sources/test', obj)
    				.success(function(res) {
    					console.log(res);
    				});
    		};
    		$scope.save = function() {
    			var obj = {
    				name: $scope.source.name,
    				url: $scope.source.url,
    				recipe_page: $scope.source.recipe_page,
    				selector: $scope.source.selector
    			};
    			Source.save({}, obj, function(res) {
    				var new_item = res;
    				$scope.sources.push(new_item);
    				$scope.source.name="";
    				$scope.source.url="";
	    			$scope.source.recipe_page="";
    				$scope.source.selector="";
    			});
    		};
    		$scope.delete = function(id, source) {
    			Source.delete({"id":id}, function(res) {
    				var i = $scope.sources.indexOf(source);
    				$scope.sources.splice(i,1);
    			});
    		}
    	}
	   })

      .state('admin.users', {
		url: '/users',
    	templateUrl: 'app/admin/templates/admin-users.html',
    	controller: function($scope, User) {
    		$scope.users = User.query();
    	}
      });
  });