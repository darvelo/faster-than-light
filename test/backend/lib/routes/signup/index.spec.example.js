var express = require('express'),
    test = express();

test.use(require('./index.js'))

var supertestChai = require('supertest-chai'),
    request = supertestChai.request;

var chai = require('chai'),
    expect = chai.expect;

chai.should();
chai.use(supertestChai.httpAsserts);

describe('Signup Page',function(){

  it('GET /signup should return html', function(done){
    request(test)
        .get('/signup')
        .set('Accept', 'application/xhtml')
        .end(function (res) {
          res.should.be.html;
          res.should.have.status(200);
//          console.log(res.text)
//          res.should.have.header('Content-Length', '20');
          // res.body.should.deep.equal([
          //     {name: 'tobi'},
          //     {name: 'toki'},
          //     {name: 'jane'}
          // ]);
          done();
        });
  });
});
