var express = require('express'),
    test = express();

test.use(require('./index.js'))

var supertestChai = require('supertest-chai'),
    request = supertestChai.request;

var chai = require('chai'),
    expect = chai.expect;

chai.should();
chai.use(supertestChai.httpAsserts);

describe('User API',function(){

  it('GET /users should return 200', function(done){
    request(test)
        .get('/users')
        .set('Accept', 'application/json')
        .end(function (res) {
          res.should.be.json;
          res.should.have.status(200);
//          res.should.have.header('Content-Length', '20');
          res.body.should.deep.equal([
              {name: 'tobi'},
              {name: 'toki'},
              {name: 'jane'}
          ]);
          done();
        });
  });
});
