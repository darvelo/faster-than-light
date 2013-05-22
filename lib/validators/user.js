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
    var ValidationError = require('../errorTypes').ValidationError;
    var libValidator = require('validator');

    var Validator = libValidator.Validator;
    Validator.prototype.error = function (msg) {
      this._errors.push(msg);
      return this;
    };

    Validator.prototype.getErrors = function () {
      return this._errors;
    };

    Validator.prototype.clearErrors = function () {
      this._errors = [];
      return this;
    };

    //Return the module definition.
    return function (modelAttributes, /* Backbone Model.save|.set */ options) {
      var errors = new ValidationError();
      var validator = new Validator();

      // lastContexts
      if (! _.isObject(modelAttributes.lastContexts)) {
        errors.add('lastContexts', 'lastContexts is not an Object');
      }

      _.each(modelAttributes.lastContexts, function (context) {
        validator.check(context, context + ' is not alphanumeric').isAlphanumeric();
      });
      errors.add('lastContexts', validator.getErrors());
      validator.clearErrors();

      // menu
      if (! _.isObject(modelAttributes.menu)) {
        errors.add('menu', 'menu is not an Object');
      }

      // paneSizes
      if (! _.isObject(modelAttributes.paneSizes)) {
        errors.add('paneSizes', 'paneSizes is not an Object');
      }

      return errors.count() ? errors : null;
    };
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
    //   return window[value];
    // });
  }
}));

