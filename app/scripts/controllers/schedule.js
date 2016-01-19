'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:ScheduleCtrl
 * @description
 * # ScheduleCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
    .filter('duration', function() {
        return function (input) {
            var duration = '';
            var hours = Math.floor(input / 60);
            var minutes = input % 60;
            if (hours > 0) {
                duration = hours + ' hours ';
            }
            if (minutes > 0) {
                duration += minutes + ' minutes';
            }

            return duration || '-';
        };
    }).controller('ScheduleCtrl', function ($scope, $window, Schedule, Switch, $modal, $q) {
        $scope.config = {
            options: {
                allowYear: false,
                allowMonth: false,
                allowWeek: true
            }
        };

        Switch.get(function ok(data) {
            $scope.switches = _.mapValues(data._embedded, 'name');
        });

        $scope.states = {
            0: 'Off',
            1: 'On',
            click: 'Click',
            up: 'Up',
            down: 'Down'
        };


        $scope.loadSchedules = function load() {
            $scope.schedules = Schedule.get(function ok() {
            }, function fail(error) {
                $window.alert(error.statusText ? error.statusText : 'Connection problem');
            });
        };

        $scope.addSchedule = function add() {
            $scope.adding = true;
            var schedule = new Schedule($scope.new);
            if (schedule.duration > 0) {
                schedule.duration = schedule.duration * schedule.multiplier;
            } else {
                delete schedule.duration;
            }
            delete schedule.multiplier;
            schedule.$save(function ok() {
                $scope.loadSchedules();
            });
        };

        $scope.removeSchedule = function remove(entry) {
            if ($window.confirm('Are you sure to delete this entry?')) {
                var schedule = new Schedule({id: entry.id});
                schedule.$delete(function ok() {
                    $scope.loadSchedules();
                });
            }

            return false;
        };

        $scope.editSchedule = function edit(entry) {
            $scope.new = angular.copy(entry);
            $scope.new.multiplier = '1';
            if (entry.duration % 60 === 0) {
                $scope.new.multiplier = '60';
                $scope.new.duration /= 60;
            }
            var modalPromise = $modal({
                contentTemplate: 'views/partials/scheduleForm.html',
                persist: true,
                scope: $scope
            });
        };

        $scope.loadSchedules();
    });