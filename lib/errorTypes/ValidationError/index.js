'use strict';

var Class = require('../CustomClass');

/*
 * Class Instantiation
 */
var ValidationError = new Class(Error);
ValidationError.prototype.init = function(message) {
  this.message = message;

  /*
   * Types of invalid fields:
   *
   * 'username'
   * 'password'
   */
  this.invalid = {};
};

// ValidationError.extend({});
ValidationError.include({
  add: function (field, message) {
    if (!this.invalid[field]) {
      this.invalid[field] = [];
    }

    this.invalid[field].push(message);

    return this;
  },
  count: function () {
    return Object.keys(this.invalid).length;
  },
});

module.exports = ValidationError;
