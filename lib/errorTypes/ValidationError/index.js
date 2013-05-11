'use strict';

/**
 * jburke's Universal Module Definition (UMD) Format
 * https://gist.github.com/jrburke/1262861
 */

/**
 * First, better, "set exports/return" option
 */
(function (define) {
  //The 'id' is optional, but recommended if this is
  //a popular web library that is used mostly in
  //non-AMD/Node environments. However, if want
  //to make an anonymous module, remove the 'id'
  //below, and remove the id use in the define shim.
  define(function (require) {
    //If have dependencies, get them here
    var _ = require('underscore');
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
      this.status = 422; // Unprocessable Entity
    };

    // ValidationError.extend({});
    ValidationError.include({
      add: function (field, message) {
        if (!message || _.isEmpty(message)) {
          return this;
        }

        if (!this.invalid[field]) {
          this.invalid[field] = [];
        }

        if (_.isArray(message)) {
          this.invalid[field] = this.invalid[field].concat(message);
        } else if (_.isString(message)) {
          this.invalid[field].push(message);
        }

        return this;
      },
      count: function () {
        return _.keys(this.invalid).length;
      },
    });

    return ValidationError;
  });
}(typeof define === 'function' && define.amd ? define : function (factory) {
  if (typeof module !== 'undefined' && module.exports) {
    //Node
    module.exports = factory(require);
  } else {
    //Create a global function. Only works if
    //the code does not have dependencies, or
    //dependencies fit the call pattern below.
    // window[id] = factory(function(value) {
    //     return window[value];
    // });
  }
}));
