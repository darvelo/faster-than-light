'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;

  exports.home.use(app);
  exports.login.use(app);
  exports.signup.use(app);
  exports.userProfile.use(app);
};


/*
 * Route Config
 */
exports.home = require('./home'),
exports.login = require('./login'),
exports.signup = require('./signup'),
exports.userProfile = require('./userProfile');


