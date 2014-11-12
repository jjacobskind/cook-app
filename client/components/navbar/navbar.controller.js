'use strict';

angular.module('cookApp')
  .factory('socket', function ($rootScope) {
  var socket = io.connect();
  var socketId = null;
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      setId: function(id){
        socketId=id;
      },
      getId: function(){
        return socketId;
      }
    };
  })
  .controller('NavbarCtrl', function ($scope, $location, $state, Auth, socket) {
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

    socket.on('send:socketId', function (data) {
      socket.setId(data.id);
    });
  });