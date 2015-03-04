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
        function Device(model) {
            this.model = model;
            this.data = null;
            this.error = null;
            this.lastUpdate =  null;
            this.loading = false;
        }

        Device.prototype = {
            handleError: function(response) {
                this.loading = false;
                this.error = 'Error occurred: ' + response.status + ' ' + (response.status === 0 ? 'API is not working' : response.statusText);
            },
            load: function () {
                this.loading = true;
                this.error = null;
                var that = this;
                this.model.get(null, function (data) {
                    that.data = data._embedded;
                    that.loading = false;
                    that.lastUpdate = new Date();
                },this.handleError);
            }
        };

        return (Device);
    });
