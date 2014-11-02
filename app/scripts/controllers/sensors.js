'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('SensorCtrl', function ($scope, $rootScope, $interval, $location, REFRESH_INTERVAL, Sensor, Device) {
        Device.data = {};
        $scope.model = Sensor;
        $scope.device = Device;
        $scope.device.load($scope.model);

        if (angular.isDefined($rootScope.intervalPromise)) {
            $interval.cancel($rootScope.intervalPromise);
        }
        $rootScope.intervalPromise = $interval(function () { $scope.device.load($scope.model); }, REFRESH_INTERVAL);
    });
