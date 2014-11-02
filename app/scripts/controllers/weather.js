'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:WeatherCtrl
 * @description
 * # WeatherCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
.controller('WeatherCtrl', function ($scope, FORECAST_ROW, FORECAST_COL) {
    $scope.source = 'http://new.meteo.pl/um/metco/mgram_pict.php?ntype=0u&row=' + FORECAST_ROW + '&col=' + FORECAST_COL + '&lang=pl';
});
