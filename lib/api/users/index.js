'use strict';

var  async = require('async');

var e, app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
  e = app.errors;
};

exports.getMyUser = function(req, res, next) {
  app.db.users.getUserById(req.user.id, function(err, user) {
    if (err) {
      return next(err);
    }

    res.send(JSON.stringify(user));
  });
};

exports.putUser = function(req, res, next) {
  app.db.users.updateUser(req.user.id, req.body, function(err, user) {
    if (err) {
      return next(err);
    }

    res.send(JSON.stringify(user));
  });
};
