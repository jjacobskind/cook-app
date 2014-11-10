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
  .controller('MainCtrl', function ($scope, $http, User, socket) {
    var user = User.get();
    $scope.search_text;
    $scope.awesomeThings = [];

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.getRecipes = function() {
      $scope.awesomeThings=[];
      $http.post('/api/sources/get_recipes', {search: $scope.search_text, id:user._id, socketId:socket.getId()})
        .success(function(recipe_list) {
          $scope.awesomeThings = $scope.awesomeThings.concat(recipe_list);
        });
    };

    $scope.tagRecipe = function(url) {
      $http.post('/api/recipes/tag_recipe', {url: url})
        .success(function(res){
        });
    };

    socket.on('send:results', function (response) {
      $scope.awesomeThings.push(response.recipe);
    });

    socket.on('send:socketId', function (data) {
      socket.setId(data.id);
    });
  });
