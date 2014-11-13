'use strict';

angular.module('cookApp')

  .controller('MainCtrl', function ($scope, $http, $timeout, User, socket, recipelistFactory) {
    var self = this;
    var user = User.get();
    this.search_text;
    this.message = "";


    this.getRecipes = function() {

      self.message="";
      $http.post('/api/sources/get_recipes', {search: self.search_text, id:user._id, socketId:socket.getId()})
        .success(function(recipe_list) {
          recipelistFactory.setRecipes(recipe_list);
        });
    };

    socket.on('send:results', function (response) {
      self.message="";
      recipelistFactory.addApiRecipe(response.recipe);
    });
  });
