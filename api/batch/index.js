'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;

  exports.contexts.use(app);
  exports.bootstrap.use(app);
};


exports.bootstrap = require('./bootstrap');
exports.contexts = require('./contexts');
