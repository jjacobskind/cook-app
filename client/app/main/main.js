'use strict';

angular.module('cookApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url:'/',
        templateUrl:'app/main/main.html',
        controller: 'MainCtrl as main'
      });
  });