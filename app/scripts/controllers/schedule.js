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

        $scope.switches = {
            heating_ground_floor: 'Podłogówka parter',
            heating_first_floor: 'Podłogówka piętro',
            hot_water_pump: 'Pompa CWU',
            light_stairs: 'Lampa schody',
            light_hall: 'Lampa hall'
        };

        $scope.newPrototype = {
            switch: 'hot_water_pump',
            state: '1',
            duration: 30,
            multiplier: '1',
            schedule: null
        };
        $scope.new = angular.copy($scope.newPrototype);

        $scope.loadSchedules =  function load() {
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
            schedule.duration = schedule.duration * schedule.multiplier;
            delete schedule.multiplier;
            schedule.$save(function ok() {
                $scope.loadSchedules()
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