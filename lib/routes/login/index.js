'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.get = function(req, res) {
  res.render('login', {
    dev: app.get('env') === 'development',
    messages: {
      error: req.flash('error'),
      info: req.flash('info'),
    },
  });
};
