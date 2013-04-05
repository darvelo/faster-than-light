var express = require('express'),
    test = require('./index.js');

var supertestChai = require('supertest-chai'),
    request = supertestChai.request;

var chai = require('chai'),
    expect = chai.expect;

chai.should();
//chai.use(supertestChai.httpAsserts);

describe('User API',function(){

  it('should return JSON', function(done){
    test.all(function (err, json) {
      if (err) return done(err);

      expect(json).to.be.an('array');
      if (json[0]) expect(json[0]).to.be.an('object');
      expect(json).to.deep.equal([
    { name: 'tobi' },
    { name: 'toki' },
    { name: 'jane' }
  ]);
      done();
    });
  });

  it('should be a pending test case');
  it.skip('should be a pending test case2', function() {
    expect(1).to.equal(1);
  });
});
