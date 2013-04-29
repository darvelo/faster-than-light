'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res) {
  res.render('login', {
    dev: process.env.NODE_ENV === 'dev',
    messages: {
      error: req.flash('error'),
      info: req.flash('info'),
    },
  });
};
