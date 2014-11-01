'use strict';

/**
 * @ngdoc service
 * @name pihomeApp.Device
 * @description
 * # Device
 * Factory in the pihomeApp.
 */
angular.module('pihomeApp')
  .factory('Device', function () {

      var self = {
          data: {},
          error: null,
          lastUpdate: null,
          loading: false,

          handleError: function(response) {
              self.loading = false;
              self.error = 'Error occurred: ' + (response.status === 0 ? 'API is not working' : response.statusText);
          },

          load: function (model) {
              self.loading = true;
              model.get(null, function (data) {
                  self.data = data;
                  self.loading = false;
                  self.lastUpdate = new Date();
              }, self.handleError);
          }
      };

      return self;
});
