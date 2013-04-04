/*global describe,it */
define(['JST/test'], function (test) {

  describe('functional tests', function () {
    describe('JST 1', function () {

      it('should exist', function () {
           expect(test).to.be.ok;
      });

      it('should give proper markup', function (){
           console.log('blah')
           expect(test({name:'yoyo'})).to.equal('<h1>yoyo</h1>\n');
      });

    });
  });

});
//}
