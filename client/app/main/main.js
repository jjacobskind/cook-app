'use strict';

angular.module('generatorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url:'/',
        templateUrl:'app/main/main.html',
        controller: 'MainCtrl'
      });
  });