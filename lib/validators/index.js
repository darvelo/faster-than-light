'use strict';

/**
 * jburke's Universal Module Definition (UMD) Format
 * https://gist.github.com/jrburke/1262861
 */

/**
 * exports object based version, if need to make a
 * circular dependency or need compatibility with
 * commonjs-like environments that are not Node.
 */
(function (define) {
  //The 'id' is optional, but recommended if this is
  //a popular web library that is used mostly in
  //non-AMD/Node environments. However, if want
  //to make an anonymous module, remove the 'id'
  //below, and remove the id use in the define shim.
  define(function (require, exports) {
    //If have dependencies, get them here
    // var a = require('./a');

    //Attach properties to exports.
    exports.user = require('./user');
    exports.context = require('./context');
  });
}(typeof define === 'function' && define.amd ? define : function (factory) {
  if (typeof exports !== 'undefined') {
    //commonjs
    factory(require, exports);
  } else {
    //Create a global function. Only works if
    //the code does not have dependencies, or
    //dependencies fit the call pattern below.
    // factory(function(value) {
    //   return window[value];
    // }, (window[id] = {}));
  }
}));
