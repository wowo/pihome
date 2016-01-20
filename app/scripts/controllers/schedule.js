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
    })
    .controller('ScheduleCtrl', function ($scope, $window, Schedule, Switch, $modal) {
        var modalInstance = null;
        var saveSuccess = function() {
            modalInstance.$promise.then(modalInstance.hide());
            $scope.loadSchedules();
        };
        $scope.config = {
            options: {
                allowYear: false,
                allowMonth: false,
                allowWeek: true
            }
        };
        $scope.states = {
            0: 'Off',
            1: 'On',
            click: 'Click',
            up: 'Up',
            down: 'Down'
        };

        Switch.get(function(data) {
            $scope.switches = _.mapValues(data._embedded, 'name');
        });

        $scope.loadSchedules = function() {
            $scope.schedules = Schedule.get(function ok() {
            }, function fail(error) {
                $window.alert(error.statusText ? error.statusText : 'Connection problem');
            });
        };

        $scope.save = function(inputForm) {
            $scope.saving = true;
            var form = angular.copy(inputForm);
            if (form.duration > 0) {
                form.duration = form.duration * form.multiplier;
            } else {
                delete form.duration;
            }
            delete form.multiplier;
            if (angular.isDefined(form.id)) {
                Schedule.update({id: form.id}, form, saveSuccess);
            } else {
                (new Schedule(form)).$save(saveSuccess);
            }
        };

        $scope.remove = function(entry) {
            if ($window.confirm('Are you sure to delete this entry?')) {
                var schedule = new Schedule({id: entry.id});
                schedule.$delete(function ok() {
                    $scope.loadSchedules();
                });
            }

            return false;
        };

        $scope.showForm = function(entry) {
            $scope.schedule = angular.copy(entry);
            $scope.schedule.multiplier = '1';
            if (!angular.isDefined($scope.schedule.duration)) {
                $scope.schedule.duration = 0;
            }
            if (entry.duration % 60 === 0) {
                $scope.schedule.multiplier = '60';
                $scope.schedule.duration /= 60;
            }
            modalInstance = $modal({
                contentTemplate: 'views/partials/scheduleForm.html',
                persist: true,
                scope: $scope
            });
        };

        $scope.loadSchedules();
    });