'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:HistoryCtrl
 * @description
 * # HistoryCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('HistoryCtrl', function ($scope, History) {
        $scope.page = $scope.page || 0;
        $scope.count = $scope.count || 25;
        $scope.items = [];

        $scope.loadMore = function () {
            $scope.page++;
            $scope.loading = true;
            History.get({page: $scope.page, count: $scope.count}, function(data) {
                $scope.items = $scope.items.concat(data._embedded);
                $scope.loading = false
            }, function (response) {
                $socpe.loading = false;
                self.error = 'Error occurred: ' + response.status + ' ' + (response.status === 0 ? 'API is not working' : response.statusText);
            });
        };

        $scope.loadMore();
    });
