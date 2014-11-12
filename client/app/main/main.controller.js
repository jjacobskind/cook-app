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
  .controller('MainCtrl', function ($scope, $http, $timeout, User, socket) {
    var user = User.get();
    $scope.search_text;
    $scope.listIndex=1;
    var recipes = [];
    $scope.recipeList = [];
    $scope.recipeCount=0;
    $scope.message = "";


    $scope.getRecipes = function() {
      recipes=[];
      $scope.message="";
      $http.post('/api/sources/get_recipes', {search: $scope.search_text, id:user._id, socketId:socket.getId()})
        .success(function(recipe_list) {
          recipes = recipes.concat(recipe_list);
          $scope.recipeCount=recipes.length;
          if(recipes.length>=10){
            $scope.recipeList = recipes.slice(0,10);
          } else {
            $timeout(function(){
              if(!recipes.length) {
                $scope.message = "Sorry, we could not find any results that matched your skill set.";
              }
              if(recipes.length<10){
                $scope.recipeList=recipes;
              }
            }, 5000);
          }
        });
    };

    socket.on('send:results', function (response) {
      recipes.push(response.recipe);
      $scope.recipeCount=recipes.length;
      if(recipes.length>=10 && $scope.listIndex===1){
        $scope.recipeList = recipes.slice(0,10);
      }
    });

    socket.on('send:socketId', function (data) {
      socket.setId(data.id);
    });

    $scope.traverseResults = function(direction){
      switch(direction){
        case "next":
          $scope.listIndex++;
          break;
        case "prev":
          $scope.listIndex--;
          break;
      }
      $scope.recipeList=recipes.slice((($scope.listIndex-1)*10)+1, $scope.listIndex*10);
    }
  });
