'use strict';

angular.module('generatorApp')
  .factory('Source', function ($resource) {
    return $resource('/api/sources/selectors/:id', {
      id: '@_id'
    },
    {
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      save: {
        method: 'POST'
      }, 
      delete: {
        method: 'DELETE',
        params: {
          id: '@_id'
        }
      }
    });
  })

  .factory('Tag', function ($resource) {
    return $resource('/api/sources/tags/:id', {
      id: '@_id'
    },
    {
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      save: {
        method: 'POST'
      }, 
      delete: {
        method: 'DELETE',
        params: {
          id: '@_id'
        }
      }
    });
  });
