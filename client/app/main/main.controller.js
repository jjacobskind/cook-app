'use strict';

angular.module('generatorApp')
  .controller('MainCtrl', function ($scope, $http, User) {
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
      $http.post('/api/sources/get_recipes', {search: $scope.search_text, id:user._id})
        .success(function(recipe_list) {
          $scope.awesomeThings = recipe_list;
          console.log(recipe_list);
        });
    };

    $scope.tagRecipe = function(url) {
      $http.post('/api/recipes/tag_recipe', {url: url})
        .success(function(res){
        });
    };
  });
