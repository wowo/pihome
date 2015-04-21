'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:ScheduleCtrl
 * @description
 * # ScheduleCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('ScheduleCtrl', function ($scope) {
        $scope.config = {
            options: {
                allowYear: false,
                allowMonth: false,
                allowWeek: true
            }
        };
        $scope.schedules = [
            {cron: '50 18 * * *', task: 'switch.patch', args: {key: 'hot_water_pump', state: 'on'}},
            {cron: '30 19 * * *', task: 'switch.patch', args: {key: 'hot_water_pump', state: 'off'}}
        ];

        $scope.addSchedule = function() {
            $scope.schedules.push({cron: '1 */5 * * 200', task: 'baz'});
        };
    });
