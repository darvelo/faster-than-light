define(['app'], function (App) {
  describe('what?', function () {

    console.log(App)

    beforeEach(function () {
      this.app = new App();
    });

    it('should equal 5', function(){
      expect(this.app.name).to.equal('appy');
    });
/*
    it('require works', function(done){
      require(['JST/test'], function (test) {
         expect(test({name: 'dude'})).to.equal('<h1>dude</h1>\n');
         console.log(typeof test)
        //console.log(test({name: 'dude'}))
        done();
      });
    });
*/
  });

  describe('Pop test!', function () {
    it('should make sure 7 is the same as 7', function(){
      var blah = 'some text';

      blah = "some text"

      expect(blah).to.equal('some text');
    });
  });
});
