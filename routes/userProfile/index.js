'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res, next) {
  // var key = req.query['api-key'];

  // // key isnt present
  // if (!key) return next(error(400, 'api key required'));

  // // key is invalid
  // if (!~apiKeys.indexOf(key)) return next(error(401, 'invalid api key'));

  // // all good, store req.key for route access
  // req.key = key;
  // next();

//  app.db.getUserById
  console.log('checking for user profile.. NOPE!');

  next(); // didn't find user. move to next handler
};
