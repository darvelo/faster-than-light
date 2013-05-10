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
    // var isNode = (typeof module !== 'undefined') ? true : false;

    var validator = require('validator');
    var ValidationError = require('../errorTypes').ValidationError;
    var errors = new ValidationError();

    //Return the module definition.
    // return value;

    return function (modelAttributes) {
      console.log('ValidationError is: ' + ValidationError);

      return errors;
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

