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
        $scope.options = {
            axes: {
                x: {type: 'date', key: 'x'},
                y: {type: 'linear'}
            },
            series: [],
            lineMode: 'linear',
            tooltip: {mode: 'axes', formatter: function(x, y) {return moment(x).fromNow() + ' : ' + y;}},
            drawLegend: true,
            drawDots: false,
            columnsHGap: 5,
            tension: 0.7
        };

        $scope.maxDate = moment().format('MM-DD-YYYY');
        $scope.until = $scope.maxDate;
        $scope.since = moment().subtract(1, 'days').format('MM-DD-YYYY');
        $scope.$watch('since + until', function () {
            $scope.data = null;
            Reading.get({since: $scope.since, until: $scope.until}, function (data) {
                data._embedded.forEach(function (element) {
                    element.x = moment(element.x);
                });
                if (!$scope.options.series.length) {
                    _.forEach(data._embedded[0], function(k, v) {
                        if ('x' !== v) {
                            $scope.options.series.push({
                                y: v,
                                id: v,
                                thickness: '1px',
                                type: 'line',
                                label: _.startCase(v),
                                drawDots: true,
                                dotSize: 2
                            });
                        }
                    });
                }
                $scope.data = data._embedded;
            });
        });
    });
