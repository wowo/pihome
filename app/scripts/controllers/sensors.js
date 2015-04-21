'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('SensorCtrl', function ($scope, Reading) {
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
                {y: 'outdoor-north', id: 'outdoor-north', thickness: '1px', type: 'line', label: 'Zewnątrz północ', drawDots: true, dotSize: 2},
                {y: 'office', id: 'office', thickness: '1px', type: 'line', label: 'Gabinet', drawDots: true, dotSize: 2},
            ],
            lineMode: 'linear',
            tooltip: {mode: 'axes', formatter: function(x, y) {return moment(x).fromNow() + ' : ' + y;}},
            drawLegend: true,
            drawDots: false,
            columnsHGap: 5,
            tension: 0.7
        };
    });
