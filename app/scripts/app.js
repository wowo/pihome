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
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.modal',
        'angularMoment',
        'angular-cache',
        'angular-cron-jobs'
    ])
    .config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
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
