'use strict';

var async = require('async');
var _ = require('underscore');
var e; // used for app.errors

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
  e = app.errors;
};

function render (req, res, errors, info) {
  res.render('signup', {
    dev: app.get('env') === 'development',
    // errors: errors || {},
    invalid: (errors && errors.invalid) || {},
    info: info || {},
  });
}

exports.get = function(req, res) {
  return render(req, res); //req.flash('error'), req.flash('info'));
};

exports.post = function(req, res, next) {
  // req.path is actual path
  // req.params.xxx is same as text from route /home/:xxx/yo
  // req.query.xxx is same as GET /home/yo?xxx=blah
  // req.query.xxx.yyy is GET /home/yo?xxx[yyy]=blah
  // req.body.xxx is same as POST /home/yo?xxx=blah
  // req.body.xxx.yyy is POST /home/yo?xxx[yyy]=blah

  var username = req.body.username;
  var password = req.body.password;
  var errors = new e.ValidationError(); // populate with validation results if failed

  if (_.contains(app.reservedSlugs, username)) {
    errors.add('username', 'Sorry, your username, "' + username + '", is reserved for our internal system.');
  }

  // TODO: validate username and password, email address and all that
  //       REMEMBER TO SANITIZE!
  // errors.push(validationErrors);
  if (username === '') {
    errors.add('username', 'Empty username.');
  }

  if (password === '') {
    errors.add('password', 'Empty password.');
  }

  if (errors.count()) { // if fails validation
    return render(req, res, errors);
  }

  // seed the database with the new user and all their boilerplate config, including example projects/tasks, etc.
  app.db.seed(username, password, function (err, results) {
    if (err instanceof e.UserExistsError) {
      return render(req, res, errors.add('username', err.message));
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
