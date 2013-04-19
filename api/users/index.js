'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.putUser = function(req, res, next) {
  // TODO: Validate JSON
  //

  console.log('params', req.body, typeof req.body);

  app.db.updateUser('516efbdc2d11144827000002', req.body, function(err, user) {
    if (err) {
      return next(err);
    }

    res.send(JSON.stringify(user));
  });
};
