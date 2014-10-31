'use strict';

angular.module('generatorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url:'/',
        templateUrl:'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('home.test1', {
        url:'/test1',
        templateUrl: 'app/main/hero_bar_templates/test1_template.html'
      })
      .state('home.test2', {
        url:'/test2',
        templateUrl: 'app/main/hero_bar_templates/test2_template.html'
      });
  });