'use strict';

angular.module('generatorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        views : {
	        '': {templateUrl: 'app/admin/admin.html'},
	        'admin_sidebar@admin': {
	        	templateUrl: 'app/admin/templates/admin-sidebar-template.html',
	        	controller: 'AdminCtrl'
	        },
	        'admin_main@admin': {
	        	templateUrl: 'app/admin/templates/admin-main.html',
	        	controller: 'AdminCtrl'
	        }
	    }
      });
  });