'use strict';

angular.module('cookApp')
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
          id:'@_id'
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
  .factory('Recipe', function ($resource) {
    return $resource('/api/sources/recipes/:id', {
      id: '@_id'
    },
    {
      get: {
        method: 'GET',
        params: {
          id:'@_id'
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
