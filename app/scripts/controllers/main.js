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
        $scope.switchDevice.load(true);

        $scope.sensorDevice = new Device(Sensor);
        $scope.sensorDevice.load();

        if (angular.isDefined($rootScope.intervalSwitch)) {
            $interval.cancel($rootScope.intervalSwitch);
        }
        $rootScope.intervalSwitch = $interval(function() {
            $scope.switchDevice.load(true);
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
                data.duration = duration !== 0 ? duration : window.prompt('How many hours', 9) * 60 ;
            }
            Switch.patch({key: key}, data, function (data) {
                var group = data.name.split(' ')[0];
                var index = _.findIndex($scope.switchDevice.data, {name: group});
                var switchesIndex = _.findIndex($scope.switchDevice.data[index].switches, {key: key});
                $scope.switchDevice.data[index].switches[switchesIndex] = data;
                $scope.loading = false;
            }, $scope.switchDevice.handleError);
        };
    });
