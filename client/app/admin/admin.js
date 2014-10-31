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
      })
      .state('admin.scrape', {
		url: '/admin',
		controller: 'AdminCtrl',
		views : {
		    '': {templateUrl: 'app/admin/admin.html'},
		    'admin_sidebar@admin': {
		    	templateUrl: 'app/admin/templates/admin-sidebar-template.html',
		    	controller: 'AdminCtrl'
		    },
		    'admin_main@admin': {
		    	templateUrl: 'app/admin/templates/admin-scrape.html',
		    	controller: 'AdminCtrl'
		    }
		}
	   })
      .state('admin.users', {
		url: '/admin',
		controller: 'AdminCtrl',
		views : {
		    '': {templateUrl: 'app/admin/admin.html'},
		    'admin_sidebar@admin': {
		    	templateUrl: 'app/admin/templates/admin-sidebar-template.html',
		    	controller: 'AdminCtrl'
		    },
		    'admin_main@admin': {
		    	templateUrl: 'app/admin/templates/admin-users.html',
		    	controller: 'AdminCtrl'
		    }
		}
      });
  });