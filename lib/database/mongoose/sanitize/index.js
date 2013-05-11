'use strict';

var _ = require('underscore');
var validator = require('validator');
var sanitize = validator.sanitize;

// recursively do XSS rewriting and HTML escaping
module.exports = function scrub (object) {
  _.each(object, function (val, key, list) {
    // also catches arrays
    if (_.isObject(val)) {
      return scrub(val);
    }

    if (_.isString(val)) {
      list[key] = val = sanitize(val).trim();
      list[key] = val = sanitize(val).xss();
      list[key] = val = sanitize(val).entityEncode();
      return;
    }
  });
};
