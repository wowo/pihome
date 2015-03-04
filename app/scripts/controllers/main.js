'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('MainCtrl', function ($scope, $rootScope, $interval, REFRESH_INTERVAL, Device, Switch, Sensor) {
        $scope.switchDevice = new Device(Switch);
        $scope.switchDevice.load();

        $scope.sensorDevice = new Device(Sensor);
        $scope.sensorDevice.load();

        if (angular.isDefined($rootScope.intervalSwitch)) {
            $interval.cancel($rootScope.intervalSwitch);
        }
        $rootScope.intervalSwitch = $interval(function() {
            $scope.switchDevice.load();
        }, REFRESH_INTERVAL);

        if (angular.isDefined($rootScope.intervalSensor)) {
            $interval.cancel($rootScope.intervalSensor);
        }
        $rootScope.intervalSensor = $interval(function() {
            $scope.sensorDevice.load();
        }, REFRESH_INTERVAL);

        $scope.toggleSwitch = function(key, newState, duration) {
            $scope.loading = true;
            var data = {state: newState};
            if (angular.isDefined(duration)) {
                data.duration = duration;
            }
            Switch.patch({key: key}, data, function (data) {
                $scope.switchDevice.data[key] = data;
                $scope.loading = false;
            }, $scope.switchDevice.handleError);
        };
    });
