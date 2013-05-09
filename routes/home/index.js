'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res, next) {
  // req.path is actual path
  // req.params.xxx is same as text from route /home/:xxx/yo
  // req.query.xxx is same as GET /home/yo?xxx=blah
  // req.query.xxx.yyy is GET /home/yo?xxx[yyy]=blah
  async.waterfall([
    function(fn) {
      app.db.bootstrap(req.user, fn);
    },
    function(bootstrap, fn) {
      bootstrap.csrf = res.locals.token;

      res.render('app',
        {
          dev: app.get('env') === 'dev',
          // regex protects against script injection attacks
          dataBootstrap: 'var bootstrap = ' + JSON.stringify(bootstrap).replace(/</g, '&lt;') + ';',
        },
        fn);
    },
    function(html, fn) {
      fn(null, html);
    },
  ],

  function(err, html) {
    if (err) {
      // console.error(err);
      return next(err);
    }

    res.send(html);
  });
};
