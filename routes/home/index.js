'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

// from grunt-contrib-livereload
var getSnippet = function () {
  /*jshint quotmark:false */
  var port = app.get('livereload');

  var snippet = [
    "<!-- livereload snippet -->",
    "<script>document.write('<script src=\"http://'",
    " + (location.host || 'localhost').split(':')[0]",
    " + ':" + port + "/livereload.js?snipver=1\"><\\/script>')",
    "</script>",
    ""
  ].join('\n');
  return snippet;
};

exports.get = function(req, res, next) {
  // req.path is actual path
  // req.params.xxx is same as text from route /home/:xxx/yo
  // req.query.xxx is same as GET /home/yo?xxx=blah
  // req.query.xxx.yyy is GET /home/yo?xxx[yyy]=blah
  console.log(req.path, req.params.id, req.query);

  async.waterfall([
    function(fn) {
      app.db.bootstrap('dave', fn); // TODO: change this to userId using sessions and authentication
    },
    function(bootstrap, fn) {
      // console.log('bootstrap is', bootstrap);

      res.render('app',
        {
          dev: app.get('env') === 'dev',
          // regex protects against script injection attacks
          dataBootstrap: 'var bootstrap = ' + JSON.stringify(bootstrap).replace(/</g, '&lt;') + ';'
        },
        fn);
    },
    function(html, fn) {
      if (app.get('env') === 'dev') {
        html = html.replace(/<\/body>/, function (w) {
          return getSnippet() + w;
        });
      }

      fn(null, html);
    },
  ],

  function(err, html) {
    if (err) {
      console.error(err);
      return next(err);
    }

    res.send(html);
  });

  // app.db.getContexts(function(err, contexts) {
  //   if (err) {
  //     console.error(err);
  //     return next(err);
  //   }

  //   res.render('index', {
  //     dev: process.env.NODE_ENV === 'dev',
  //     // regex protects against script injection attacks
  //     dataBootstrap: 'var bootstrap = ' + JSON.stringify(contexts).replace(/</g, '&lt;') + ';'

  //   }, function(err, html) {
  //     if (err) {
  //       console.error(err);
  //       return next(err);
  //     }

  //     if (process.env.NODE_ENV === 'dev') {
  //       html = html.replace(/<\/body>/, function (w) {
  //         return getSnippet() + w;
  //       });
  //     }

  //     res.send(html);
  //   });
  // });
};
