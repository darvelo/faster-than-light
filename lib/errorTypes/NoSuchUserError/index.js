'use strict';

var Class = require('../CustomClass');

/*
 * Class Instantiation
 */
var NoSuchUserError = new Class(Error);
NoSuchUserError.prototype.init = function(message) {
  this.message = message;
};

module.exports = NoSuchUserError;
