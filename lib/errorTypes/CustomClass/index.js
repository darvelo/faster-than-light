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
    // var a = require('a');

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
    //  klass.fn._super = klass.__proto__; // __proto__ deprecated?

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
        delete obj.included;

        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            this.fn[prop] = obj[prop];
          }
        }

        if (typeof included === 'function') {
          included.call(this);
        }

        return this;
      };

      /**
       * extend the class static functions and variables
       * @param  {Object} obj An object with properties to extend the class
       * @return {Class}      Returns the klass object itself
       */
      klass.extend = function (obj) {
        var extended = obj.extended;
        delete obj.extended;

        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            this[prop] = obj[prop];
          }
        }

        if (typeof extended === 'function') {
          extended.call(this);
        }

        return this;
      };

      return klass;
    };

    return Class;
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



