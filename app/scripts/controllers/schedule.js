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
    }).controller('ScheduleCtrl', function ($scope, $window, Schedule, Switch) {
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

        $scope.newPrototype = {
            switch: 'hot_water_pump',
            state: '1',
            duration: 30,
            multiplier: '1',
            schedule: null
        };
        $scope.new = angular.copy($scope.newPrototype);

        $scope.loadSchedules = function load() {
            $scope.schedules = Schedule.get(function ok() {
                $scope.adding = false;
                $scope.new = angular.copy($scope.newPrototype);
            }, function fail(error) {
                $window.alert(error.statusText ? error.statusText : 'Connection problem');
                $scope.adding = false;
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

        $scope.loadSchedules();
    });