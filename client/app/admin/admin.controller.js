'use strict';

angular.module('generatorApp')
  .factory('sideButtonFactory', function() {
    var buttons = [
      {
        'title':'Scraping Selectors',
        'state': 'scrape'
      },
      {
        'title':'Manage Users',
        'state': 'users'
      }
    ];
    return {
      buttons: buttons
    };
  })
  .controller('AdminCtrl', function ($scope, $http, Auth, User, sideButtonFactory, $state) {
    // Use the User $resource to fetch all users

    $scope.sideButtons = sideButtonFactory.buttons;

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
