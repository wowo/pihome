'use strict';

describe('Service: Device', function () {

  // load the service's module
  beforeEach(module('pihomeApp'));

  // instantiate service
  var Device;
  beforeEach(inject(function (_Device_) {
    Device = _Device_;
  }));

  it('should do something', function () {
    expect(!!Device).toBe(true);
  });

});
