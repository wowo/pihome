'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:ScheduleCtrl
 * @description
 * # ScheduleCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('ScheduleCtrl', function ($scope, Schedule) {
        $scope.config = {
            options: {
                allowYear: false,
                allowMonth: false,
                allowWeek: true
            }
        };
        $scope.schedules = Schedule.get();

        $scope.addSchedule = function() {
            $scope.schedules.push({cron: '1 */5 * * 200', task: 'baz'});
        };
    });
