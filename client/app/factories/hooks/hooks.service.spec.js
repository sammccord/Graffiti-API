'use strict';

describe('Service: hooks', function () {

  // load the service's module
  beforeEach(module('graffitiApiApp'));

  // instantiate service
  var hooks;
  beforeEach(inject(function (_hooks_) {
    hooks = _hooks_;
  }));

  it('should do something', function () {
    expect(!!hooks).toBe(true);
  });

});
