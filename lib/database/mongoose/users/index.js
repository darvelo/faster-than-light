'use strict';

var async = require('async');
var _ = require('underscore');
var libUser = require('./model');
var sanitize = libUser.sanitize;

var e, app, mongoose, User;
exports.use = function (appInstance, mongooseInstance) {
  app = appInstance;
  e = app.errors;

  mongoose = mongooseInstance;
  User = libUser.Schema(mongoose);

  return User;
};


exports.getUserById = function (userId, cb) {
  User.findById(userId)
    .exec(cb);
};

exports.getUserByName = function (username, cb) {
  User.find({ username: username }, function (err, users) {
    if (err) {
      return cb(err);
    } else if (users.length !== 1) {
      return cb(new Error('improper number of users returned'));
    }

    cb(null, users[0]);
  });
};

exports.updateUser = function (userId, userModel, cb) {
  // remove keys that are not user-modifiable and sanitize props
  userModel = libUser.sanitize(userModel);

  if (_.isEmpty(userModel.lastContexts)) {
    // for some reason it won't save an empty object literal.. it keeps the old value
    userModel.lastContexts = [];
  }

  User.findById(userId, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new e.NoSuchUserError());
    }

    user = _.extend(user, userModel);
    user.save(cb);
  });
};
