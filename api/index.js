'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;

  exports.users.use(app);
  exports.contexts.use(app);
};


exports.contexts = require('./contexts');
exports.users = require('./users');

