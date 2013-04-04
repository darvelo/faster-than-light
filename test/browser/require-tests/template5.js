define(['JST/templ5'], function (templ) {
  describe('template 5 test', function () {
    it('should give me proper output', function(){
      var output = templ({name: "Angel"});
      console.log("output is ", output)

      expect(output).to.equal('<p>This is another template, Angel!!!!!</p>\n')
    });
  });
});
