'use strict';

describe('Service: Switchservice', function () {

  // load the service's module
  beforeEach(module('pihomeApp'));

  // instantiate service
  var Switchservice;
  beforeEach(inject(function (_Switchservice_) {
    Switchservice = _Switchservice_;
  }));

  it('should do something', function () {
    expect(!!Switchservice).toBe(true);
  });

});
