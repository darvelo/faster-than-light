'use strict';

/**
 * Class Generator
 * @param {Object} parent An object to inherit prototype from for our new class
 * @return {Class} Returns the bare klass object itself to start building on. Has property extensions (empty init, extend, include, proxy, fn).
 */

var Class = function (parent) {
  /**
   * A class with which to build other classes from
   */
  var klass = function () {
    this.init.apply(this, arguments);
  };

  /*
   * Inherit parent's prototype properties
   */
  if (parent) {
    var Subclass = function () {};
    Subclass.prototype = parent.prototype;
    klass.prototype = new Subclass();
  }

  klass.prototype.init = function() {};

  // shortcuts
  klass.fn = klass.prototype;
  klass.fn.parent = klass;
//  klass._super = klass.__proto__; // __proto__ deprecated?

  /**
   * Creates a wrapper function to allow arbitrary scope
   * @param  {Function} func A function to execute in a desired context
   * @return {Function} The return value from the function executed in the desired scope with any arguments applied.
   */
  klass.proxy = function(func) {
    var self = this;
    return function() {
      return func.apply(self, arguments);
    };
  };
  // add instance proxy function too
  klass.fn.proxy = klass.proxy;

  /**
   * include functions and variables into class instances
   * @param  {Object} obj An object with properties to include in class instances
   * @return {Class}     The klass object itself
   */
  klass.include = function (obj) {
    var included = obj.included;

    for (var prop in obj) {
      this.fn[prop] = obj[prop];
    }

    if (included) {
      included(this);
    }
  };

  /**
   * extend the class static functions and variables
   * @param  {Object} obj An object with properties to extend the class
   * @return {Class}      Returns the klass object itself
   */
  klass.extend = function (obj) {
    var extended = obj.extended;

    for (var prop in obj) {
      this[prop] = obj[prop];
    }

    if (extended) {
      extended(this);
    }

    return this;
  };

  return klass;
};

module.exports = Class;
