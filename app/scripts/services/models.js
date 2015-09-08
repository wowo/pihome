'use strict';

/**
 * @ngdoc service
 * @name pihomeApp.models
 * @description
 * # models
 * Factory in the pihomeApp.
 */
angular.module('pihomeApp')
    .factory('Switch', function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT + '/switch/:key', {id: '@key'}, {'patch': {method: 'PATCH'}});
    })
    .factory('Sensor', function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT + '/sensor');
    })
    .factory('Reading', function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT + '/reading');
    })
    .factory('History', function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT + '/history');
    })
    .factory('Schedule', function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT + '/cron/:id', {id: '@id'});
    });
