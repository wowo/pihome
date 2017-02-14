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

        $scope.maxDate = moment().format('MM-DD-YYYY');
        $scope.until = $scope.maxDate;
        $scope.since = moment().subtract(1, 'days').format('MM-DD-YYYY');
        $scope.$watch('since + until', function () {
            Reading.get({since: $scope.since, until: $scope.until}, function (data) {
                if (!data._embedded.length) {
                    return false;
                }
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
                function drawChart() {
                    var dataTable = new google.visualization.DataTable();
                    var series = _.pull(_.keys(data._embedded[0]), 'x');
                    var rowValues = [];
                    dataTable.addColumn('date', 'Date');
                    _.forEach(series, function (value) {
                        dataTable.addColumn('number', value);
                    });

                    _.forEach(data._embedded, function (row) {
                        rowValues.push(new Date(row.x));
                        _.forEach(series, function (column) {
                            rowValues.push(row[column]);
                        });
                        dataTable.addRow(rowValues);
                        rowValues = [];
                    });


                    var options = {
                        chartArea: {
                            top: 5,
                            width: '88%',
                            height: '75%'
                        },
                        legend: {
                            position: 'bottom'
                        },
                        hAxis: {
                            format: 'MMM d, HH:mm',
                            viewWindowMode: 'pretty',
                            minorGridlines: {
                                count: 4
                            }
                        }
                    };

                    var chart = new google.visualization.LineChart(document.getElementById('chart'));

                    var dateFormatter = new google.visualization.DateFormat({ pattern: "MMM d, HH:mm"});
                    dateFormatter.format(dataTable, 0);
                    chart.draw(dataTable, options);
                }
            });
        });
    });
