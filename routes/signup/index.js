'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res, next) {
  res.render('signup', {
    dev: process.env.NODE_ENV === 'dev',
    messages: {
      error: req.flash('error'),
      info: req.flash('info'),
    },
  });
};

exports.post = function(req, res, next) {
  // req.path is actual path
  // req.params.xxx is same as text from route /home/:xxx/yo
  // req.query.xxx is same as GET /home/yo?xxx=blah
  // req.query.xxx.yyy is GET /home/yo?xxx[yyy]=blah
  // req.body.xxx is same as POST /home/yo?xxx=blah
  // req.body.xxx.yyy is POST /home/yo?xxx[yyy]=blah

  var username = req.body.username,
      password = req.body.password;

  // TODO: validate username and password, email address and all that
  var validationResult = 1;
  if (!validationResult) { // if fails validation
    res.render('signup', {
      dev: process.env.NODE_ENV === 'dev',
      errors: ['username invalid', 'password invalid', 'email invalid'], // populate with validation results
    });

    return;
  }

  // seed the database with the new user and all their boilerplate config, including example projects/tasks, etc.
  app.db.seed(username, password, function (err, results) {
    if (err instanceof app.errors.UserExists) {
      res.render('signup', {
        dev: process.env.NODE_ENV === 'dev',
        errors: err.message,
      });

      return;
    } else if (err) {
      return next(err);
    }

    req.login(results.user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });
  });
};
