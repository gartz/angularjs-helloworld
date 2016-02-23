describe('controllers', () => {
  'use strict';
  let vm;

  beforeEach(angular.mock.module('angularHelloworld'));

  beforeEach(inject(($controller) => {
    vm = $controller('MainController');
  }));

  it('should have link to the github API', () => {
    expect(vm.apiEndpoint).toEqual(jasmine.any(String));
  });

});
