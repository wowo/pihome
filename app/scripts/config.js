"use strict";

angular.module('config', [])

.constant('ENV', 'development')

.constant('API_ENDPOINT', 'http://192.168.254.128:8999')

.constant('REFRESH_INTERVAL', 5000)

.constant('FORECAST_ROW', 463)

.constant('FORECAST_COL', 211)

;