'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('SensorCtrl', function ($scope, $rootScope, $interval, $location, REFRESH_INTERVAL, Sensor, Device, Reading) {
        Device.data = {};
        $scope.model = Sensor;
        $scope.device = Device;
        $scope.device.load($scope.model);

        if (angular.isDefined($rootScope.intervalPromise)) {
            $interval.cancel($rootScope.intervalPromise);
        }
        $rootScope.intervalPromise = $interval(function () { $scope.device.load($scope.model); }, REFRESH_INTERVAL);
        Reading.get(null, function (data) {
            data._embedded.forEach(function (element) {
                element.x = moment(element.x);
            });
            $scope.data = data._embedded;
        });
        $scope.options = {
            axes: {
                x: {type: 'date', key: 'x'},
                y: {type: 'linear'}
            },
            series: [
                {y: 'office', id: 'office', thickness: '1px', type: 'line', label: 'Gabinet', drawDots: true, dotSize: 2},
                {y: 'office2', id: 'office2', thickness: '1px', type: 'line', label: 'Gabinet Raspberry PI (okno)', drawDots: true, dotSize: 2},
                {y: 'outdoor-west', id: 'outdoor-west', thickness: '1px', type: 'line', label: 'Na zewnątrz - zachód', drawDots: true, dotSize: 2}
            ],
            lineMode: 'linear',
            tooltip: {mode: 'axes', formatter: function(x, y, series) {return moment(x).fromNow() + ' : ' + y;}},
            drawLegend: true,
            drawDots: false,
            columnsHGap: 5,
            tension: 0.7
        }
    });
