'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res) {
/*  userApi.all(function(err, users) {
    res.send(200, users);
  });
*/
};
