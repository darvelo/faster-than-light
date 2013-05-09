'use strict';

var Class = require('../CustomClass');

/*
 * Class Instantiation
 */
var UserExistsError = new Class(Error);
UserExistsError.prototype.init = function(message) {
  this.message = message;
};

module.exports = UserExistsError;
