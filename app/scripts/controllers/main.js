'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('MainCtrl', function ($scope, REFRESH_INTERVAL, Device, Switch, Sensor) {
        $scope.switchDevice = new Device(Switch);
        $scope.sensorDevice = new Device(Sensor);

        $scope.switchDevice.load(true, REFRESH_INTERVAL * 2, 'switch');
        $scope.sensorDevice.load(false, REFRESH_INTERVAL, 'sensor');

        $scope.toggleSwitch = function (switchObj, newState, duration) {
            if ('two_way' == switchObj.type) {
                switchObj[newState] = {loading: true};
            } else {
                switchObj.loading = true;
            }
            var data = {state: newState};
            if (angular.isDefined(duration)) {
                data.duration = duration !== 0 ? duration : window.prompt('How many hours', 9) * 60;
            }
            Switch.patch({key: switchObj.key}, data, function (data) {
                var group = data.name.split(' ')[0];
                data.name = data.name.split(' ').slice(1).join(' ');
                data.name = data.name.charAt(0).toUpperCase() + data.name.substr(1);
                var index = _.findIndex($scope.switchDevice.data, {name: group});
                var switchesIndex = _.findIndex(_.values($scope.switchDevice.data[index].switches), {key: switchObj.key});
                $scope.switchDevice.data[index].switches[switchesIndex] = data;
                if ('two_way' == switchObj.type) {
                    switchObj[newState].loading = false;
                } else {
                    switchObj.loading = false;
                }
            }, $scope.switchDevice.handleError);
        };
    });
