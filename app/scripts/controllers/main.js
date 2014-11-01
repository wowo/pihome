'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('MainCtrl', function ($scope, $interval, REFRESH_INTERVAL, Switch) {
        var handleError = function(response) {
            $scope.loading = false;
            $scope.error = 'Error occurred: ' + (response.status === 0 ? 'API is not working' : response.statusText);
        };

        $scope.loadSwitches = function () {
            $scope.loading = true;
            Switch.get(null, function (data) {
                $scope.data = data;
                $scope.loading = false;
                $scope.lastUpdate = new Date();
            }, handleError);
        };

        $scope.toggleSwitch = function(key, newState) {
            $scope.loading = true;
            Switch.patch({key: key}, {state: newState}, function (data) {
                $scope.data._embedded[key] = data;
                $scope.loading = false;
            }, handleError);
        };

        $interval($scope.loadSwitches, REFRESH_INTERVAL);
    });
