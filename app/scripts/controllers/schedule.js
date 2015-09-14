'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:ScheduleCtrl
 * @description
 * # ScheduleCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .controller('ScheduleCtrl', function ($scope, $window, Schedule) {
        $scope.config = {
            options: {
                allowYear: false,
                allowMonth: false,
                allowWeek: true
            }
        };
        $scope.loadSchedules =  function load () {
            $scope.schedules =Schedule.get(function ok (data) {}, function fail(error) {
                $window.alert(error.statusText ? error.statusText : 'Connection problem');
            });
        };

        $scope.addSchedule = function add() {
            $scope.schedules.push({cron: '1 */5 * * 200', task: 'baz'});
        };

        $scope.removeSchedule = function remove(entry) {
            if ($window.confirm('Are you sure to delete this entry?')) {
                var schedule = new Schedule({id: entry.id});
                schedule.$delete(function ok () {
                    $scope.loadSchedules();
                });
            }

            return false;
        };

        $scope.loadSchedules();
    });
