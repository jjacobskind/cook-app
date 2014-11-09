'use strict';

angular.module('cookApp')
  .controller('NavbarCtrl', function ($scope, $location, $state, Auth) {
    $scope.menu = [
      {
        'title': 'Profile',
        'state': 'profile'
      }
    ];
    $scope.$state = $state;
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });