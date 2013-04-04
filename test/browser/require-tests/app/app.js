define(function (require) { /*define(['1', '2', '3'], function (arg1, arg2, arg3) { */
  'use strict';

  var App = require('app');

  describe('App Test', function() {

    // beforeEach(function(done) {
    //   var self = this;
    //   require(['app'], function(App){
    //     self.App = App;
    //     done();
    //   });
    // });

    it('should give me an App Object', function(){
      var app = new App();
      expect(app).to.be.an('object');
    });
  });

});
