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
        'ngResource',
        'ngRoute',
        'config',
        'n3-line-chart',
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.modal',
        'angular-cache',
        'angular-cron-jobs'
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
            .when('/schedule', {
                templateUrl: 'views/schedule.html',
                controller: 'ScheduleCtrl'
            })
            .when('/history', {
                templateUrl: 'views/history.html',
                controller: 'HistoryCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function ($rootScope, $location) {
        $rootScope.location = $location;
    });
