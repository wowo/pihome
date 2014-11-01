'use strict';

/**
 * @ngdoc overview
 * @name pihomeApp
 * @description
 * # pihomeApp
 *
 * Main module of the application.
 */
angular
  .module('pihomeApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'config'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/sensors', {
        templateUrl: 'views/sensors.html',
        controller: 'SensorCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function($rootScope, $location) {
        $rootScope.location = $location;
    });
