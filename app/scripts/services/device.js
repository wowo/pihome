'use strict';

/**
 * @ngdoc service
 * @name pihomeApp.Device
 * @description
 * # Device
 * Factory in the pihomeApp.
 */
angular.module('pihomeApp')
    .factory('Device', function ($timeout) {
        function Device(model) {
            this.model = model;
            this.data = null;
            this.error = null;
            this.loading = false;
        }

        Device.prototype = {
            handleError: function(response) {
                this.loading = false;
                this.error = 'Error occurred: ' + response.status + ' ' + (response.status === 0 ? 'API is not working' : response.statusText);
            },
            load: function (groupAndSort, interval) {
                var that = this;
                this.loading = true;
                this.error = null;
                this.model.get(null, function (data) {
                    if (groupAndSort) {
                        var order = {
                            Brama: 1,
                            Roleta: 2,
                            Pompa: 3,
                            Podłogówka: 4,
                            Lampa: 5
                        };
                        that.data = _.groupBy(data._embedded, function (val) {
                            return val.name.split(' ')[0];
                        });
                        that.data = _.mapValues(that.data, function (groupped) {
                            return _.mapValues(groupped, function (val) {
                                val.name = val.name.split(' ').slice(1).join(' ');
                                val.name = val.name.charAt(0).toUpperCase() + val.name.substr(1);

                                return val;
                            });
                        });
                        that.data = _.map(that.data, function (val, key) {
                            return {
                                name: key,
                                switches: val
                            };
                        });
                        that.data = _.sortBy(that.data, function (val) {
                            return order[val.name];
                        });
                    } else {
                        that.data = data._embedded;
                    }
                    $timeout(function() {
                        that.load(groupAndSort, interval);
                    }, interval);

                    that.loading = false;
                },this.handleError);
            }
        };

        return (Device);
    });
