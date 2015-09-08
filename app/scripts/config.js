"use strict";

angular.module('config', [])

.constant('ENV', 'development')

.constant('API_ENDPOINT', 'http://0.0.0.0:8999')

.constant('REFRESH_INTERVAL', 60000)

.constant('FORECAST_ROW', 463)

.constant('FORECAST_COL', 211)

;