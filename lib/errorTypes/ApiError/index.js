'use strict';

var Class = require('../CustomClass');

/*
 * Class Instantiation
 */
var ApiError = new Class(Error);
ApiError.prototype.init = function(message) {
  this.message = message;
};

module.exports = ApiError;
