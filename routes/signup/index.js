'use strict';

var async = require('async'),
    _ = require('underscore');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

function render (res, errors, info) {
  res.render('signup', {
    dev: process.env.NODE_ENV === 'dev',
    messages: {
      errors: errors,
      info: info,
    }
  });
}

exports.get = function(req, res) {
  return render(res, req.flash('error'), req.flash('info'));
};

exports.post = function(req, res, next) {
  // req.path is actual path
  // req.params.xxx is same as text from route /home/:xxx/yo
  // req.query.xxx is same as GET /home/yo?xxx=blah
  // req.query.xxx.yyy is GET /home/yo?xxx[yyy]=blah
  // req.body.xxx is same as POST /home/yo?xxx=blah
  // req.body.xxx.yyy is POST /home/yo?xxx[yyy]=blah

  var username = req.body.username,
      password = req.body.password,
      errors = []; // populate with validation results if failed

  if (_.contains(app.reservedSlugs, username)) {
    errors.push('Sorry, your username, "' + username + '", is reserved for our internal system.');
  }

  // TODO: validate username and password, email address and all that
  //       REMEMBER TO SANITIZE!
  // errors.push(validationErrors);
  if (username === '' || password === '') {
    errors.push('Empty username or password.');
  }

  if (! _.isEmpty(errors)) { // if fails validation
    return render(res, errors);
  }

  // seed the database with the new user and all their boilerplate config, including example projects/tasks, etc.
  app.db.seed(username, password, function (err, results) {
    if (err instanceof app.errors.UserExists) {
      return render(res, err.message);
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
