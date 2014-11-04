/*global describe, it, before, beforeEach, after, afterEach */

var assert = require('assert'),
  should = require('should'),
  naming = require('../lib/naming');


describe('naming', function () {
  describe('#encode()', function () {
    it('should return a valid name code', function () {
      var code = naming.encode('PPS', 'Access Control', 'Low Level Signal');
      // console.log(code);
      code.should.eql(['1', '0', 'F']);
    });
  });
});
