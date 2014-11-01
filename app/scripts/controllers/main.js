'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('MainCtrl', function ($scope, $rootScope, $interval, REFRESH_INTERVAL, Device, Switch) {
        Device.data = {};
        $scope.model = Switch;
        $scope.device = Device;
        $scope.device.load($scope.model);

        if (angular.isDefined($rootScope.intervalPromise)) {
            $interval.cancel($rootScope.intervalPromise);
        }
        $rootScope.intervalPromise = $interval(function () { $scope.device.load($scope.model); }, REFRESH_INTERVAL);

        $scope.toggleSwitch = function(key, newState) {
            $scope.loading = true;
            Switch.patch({key: key}, {state: newState}, function (data) {
                $scope.device.data._embedded[key] = data;
                $scope.loading = false;
            }, $scope.device.handleError);
        };
    });
