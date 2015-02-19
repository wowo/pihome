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
    'angularMoment',
    'config',
    'n3-line-chart'
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
      .when('/weather', {
          templateUrl: 'views/weather.html',
          controller: 'WeatherCtrl'
      })
      .when('/history', {
          templateUrl: 'views/history.html',
          controller: 'HistoryCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function($rootScope, $location) {
        $rootScope.location = $location;
    });
