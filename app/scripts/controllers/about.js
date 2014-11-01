'use strict';

/**
 * @ngdoc function
 * @name pihomeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pihomeApp
 */
angular.module('pihomeApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
