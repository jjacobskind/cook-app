'use strict';

angular.module('cookApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('onboard', {
        url: '/onboard',
        templateUrl: 'app/account/onboard/onboard.html',
        controller: 'OnboardCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'ProfileCtrl as profile'
      })
      .state('profile.favorite', {
        url: '/profile/favorites',
        templateUrl: 'app/account/profile/fave-recipes/fave-recipes.html',
        controller: 'FavRecipesCtrl'
      })
      .state('profile.recommendations', {
        url: '/profile/recommendations',
        templateUrl: 'app/account/profile/recommendations/recommendations.html',
        controller: 'RecommendedRecipesCtrl'
      });
  });