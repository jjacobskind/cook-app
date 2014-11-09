'use strict';

angular.module('cookApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        templateUrl: 'app/admin/admin.html'
      })

      .state('admin.scrape', {
    		url: '/scrape',
      	templateUrl: 'app/admin/templates/admin-scrape/admin-scrape.html',
        controller: 'AdminScrapeCtrl'
      })

      .state('admin.users', {
    		url: '/users',
      	templateUrl: 'app/admin/templates/admin-users/admin-users.html',
      	controller: 'AdminUserCtrl'
      })

      .state('admin.tags', {
        url: '/tags',
        templateUrl: 'app/admin/templates/admin-tags/admin-tags.html',
        controller: 'AdminTagsCtrl'
      })

      .state('admin.skills', {
        url: '/tags',
        templateUrl: 'app/admin/templates/admin-tags/admin-tags.html',
        controller: 'AdminTagsCtrl'
      });;
  });