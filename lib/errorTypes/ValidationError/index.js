'use strict';

// var CustomError = require('../CustomError');
// var MyError = new CustomError();

var MyError = function () {};
MyError.prototype = new Error();


MyError.prototype.invalid = {};

/*
 * Types of invalid fields:
 *
 * 'username'
 * 'password'
 */

MyError.prototype.add = function (field, message) {
  if (!this.invalid[field]) {
    this.invalid[field] = [];
  }

  this.invalid[field].push(message);

  return this;
};

MyError.prototype.count = function () {
  return Object.keys(this.invalid).length;
};

module.exports = MyError;
