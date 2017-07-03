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
            this.data = [];
            this.error = null;
            this.loading = false;
        }

        Device.prototype = {
            handleError: function (response) {
                this.loading = false;
                this.error = 'Error occurred: ' + response.status + ' ' + (response.status <= 0 ? 'API is not working' : response.statusText);
            },
            processData: function (data, groupAndSort, cache) {
                var result = _.values(data);
                if (angular.isDefined(cache)) {
                    var cached = cache.get('values') || null;
                    if (!cached) {
                        cache.put('values', _.filter(result, {stateless: true})); // we cache stuff
                    } else {
                        result = _.reject(result, {stateless: true}); // otherwise we won't process items returned from cache, which are already returned from cache
                    }
                }

                if (groupAndSort) {
                    var order = {
                        Brama: 1,
                        Roleta: 2,
                        Pompa: 3,
                        Podłogówka: 4,
                        Lampa: 5
                    };
                    result = _.groupBy(result, function (val) {
                        return val.name.split(' ')[0];
                    });
                    result = _.mapValues(result, function (groupped) {
                        return _.mapValues(groupped, function (val) {
                            val.name = val.name.split(' ').slice(1).join(' ');
                            val.name = val.name.charAt(0).toUpperCase() + val.name.substr(1);

                            return val;
                        });
                    });
                    result = _.map(result, function (val, key) {
                        return {
                            name: key,
                            switches: val
                        };
                    });
                    result = _.sortBy(result, function (val) {
                        return order[val.name];
                    });
                }

                return result;
            },
            load: function (groupAndSort, interval, cache) {
                var that = this;
                this.loading = true;
                this.error = null;
                if (angular.isDefined(cache)) {
                    this.data = this.processData(cache.get('values') || [], groupAndSort);
                }
                this.model.get(null, function ok (data) {
                    if (!angular.isDefined(cache)) {
                        that.data = [];
                    }
                    that.data = that.data.concat(that.processData(data._embedded, groupAndSort, cache));
                    $timeout(function () {
                        that.load(groupAndSort, interval);
                    }, interval);

                    that.loading = false;
                }, function error (response) {
                    that.handleError(response);
                });
            }
        };

        return (Device);
    });
