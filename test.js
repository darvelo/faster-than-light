// https://github.com/codefather/supertest-chai

var supertestChai = require('supertest-chai'),
    request = supertestChai.request;

var chai = require('chai'),
    expect = chai.expect;

chai.should();
chai.use(supertestChai.httpAsserts);

//process.env.NODE_ENV = 'dev';
var app = require('./zero.js');

describe('User API',function(){

  it('GET /user should return 201', function(done){
    request(app)
        .get('/user')
        .set('Accept', 'application/json')
/*        .expect('Content-Type', /json/)
        .expect(201)
        .expect('Content-Length', '20')
        .expect(201, {name: 'tobi'}, function(err, res) {
          if (err) done(err);

          done();
        });
*/        // .end(function(err, res) {
        .end(function (res) {
          res.should.be.json;
          res.should.have.status(201);
          res.should.have.header('Content-Length', '20');
          res.body.should.deep.equal({name: 'tobi'});
          done();
        });
        //   console.log(res)
        //   done();
        // });
  });

  it('should equal test', function(done){
    // Access to superagent's agent, making requests using 'user' persists cookies ascross them
    var user = request(app).agent();

    user
      .get('/questions')
      .end(function (res) {
           res.should.be.html;
           res.should.have.status(200);
           res.should.have.header('Content-Length', '4');
           res.text.should.equal('test');
           done();
       });
  });

});

describe("Framework test", function () {

  beforeEach(function () {
    this.foo = 'bar',
    this.beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };
  });

  it("should do the first thing", function () {
    expect(this.foo).to.be.a('string');
    expect(this.foo).to.equal('bar');
    expect(this.foo).to.have.length(3);
    expect(this.beverages).to.have.property('tea').with.length(3);
  });

  it("should do the second thing", function () {
    var answer = 43;

    // AssertionError: expected 43 to equal 42.
    expect(answer).to.equal(43);

    // AssertionError: topic [answer]: expected 43 to equal 42.
    expect(answer, 'topic [answer]').to.equal(43);
  });
});
