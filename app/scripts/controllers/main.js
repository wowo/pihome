'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('MainCtrl', function ($scope, REFRESH_INTERVAL, Device, Switch, Sensor, CacheFactory) {
        $scope.switchDevice = new Device(Switch);
        $scope.sensorDevice = new Device(Sensor);
        if (!CacheFactory.get('switch')) {
            CacheFactory('switch', {
                storageMode: 'localStorage',
                maxAge: 60*60*1000*24*31 // 31 days
            });
        }
        $scope.switchDevice.load(true, REFRESH_INTERVAL * 2, CacheFactory.get('switch'));
        $scope.sensorDevice.load(false, REFRESH_INTERVAL);

        $scope.toggleSwitch = function (switchObj, newState, duration) {
            if ('two_way' === switchObj.type) {
                switchObj[newState] = {loading: true};
            } else {
                switchObj.loading = true;
            }
            var data = {state: newState};
            if (angular.isDefined(duration) && duration) {
                duration = convertDurationToMinutes(duration);
                data.duration = duration !== 0 ? duration : window.prompt('How many hours', 9) * 60;
            }
            Switch.patch({key: switchObj.key}, data, function (data) {
                var group = data.name.split(' ')[0];
                data.name = data.name.split(' ').slice(1).join(' ');
                data.name = data.name.charAt(0).toUpperCase() + data.name.substr(1);
                var index = _.findIndex($scope.switchDevice.data, {name: group});
                var switchesIndex = _.findIndex(_.values($scope.switchDevice.data[index].switches), {key: switchObj.key});
                $scope.switchDevice.data[index].switches[switchesIndex] = data;
                if ('two_way' === switchObj.type) {
                    switchObj[newState].loading = false;
                } else {
                    switchObj.loading = false;
                }
            }, $scope.switchDevice.handleError);
        };

        function convertDurationToMinutes(duration) {
            var out = 0;
            if (duration.indexOf('m') > -1) {
                out = 1* duration.replace('m', '');
            }
            if (duration.indexOf('h') > -1) {
                out = 60 * duration.replace('h', '');
            }

            return out;
        }
    })
    .filter('durationLiteral', function() {
        return function (input) {
            input = input || '';
            input = input.replace('h', ' hours').replace('m', ' minutes').replace(/^X$/, 'X hours');

            return input;
        };
    });
