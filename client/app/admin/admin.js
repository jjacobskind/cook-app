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
            $scope.source = {
                name:"",
                url:"",
                selector:"",
                recipe_page:""
            };
            $scope.preview = "";
    		$scope.test = function() {
    			var obj = {
    				recipe_page: $scope.source.recipe_page,
    				selector: $scope.source.selector
    			};
    			$http.post('/api/sources/test', obj)
    				.success(function(res) {
    					$scope.preview=res;
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
    				$scope.sources=res.array;
    				$scope.reset();
    			});
    		};
    		$scope.delete = function(id, source) {
    			Source.delete({"id":id}, function(res) {
    				var i = $scope.sources.indexOf(source);
    				$scope.sources.splice(i,1);
    			});
    		};
            $scope.reset = function() {
                $scope.source.name="";
                $scope.source.url="";
                $scope.source.recipe_page="";
                $scope.source.selector="";
                $scope.preview="";
            };
            $scope.fillForm = function(source) {
                $scope.source.name=source.name;
                $scope.source.url=source.url;
                $scope.source.selector=source.selector;
                $scope.source.recipe_page=source.recipe_page;
                $scope.test();
            };
            $scope.makeSeed = function() {
                $http.get('/api/sources/seed')
                    .success(function(res) {
                        console.log(res);
                    });
            };
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