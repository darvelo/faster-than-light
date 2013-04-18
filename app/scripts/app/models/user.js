define([
  'backbone'
],

function (Backbone) {
  'use strict';

  var User = Backbone.Model.extend({
    urlRoot: '/api/users', // used for consistency with other models
    defaults: {

    },

    validate: function validate (attrs, options) {

      return; // return nothing if validate passes, return error on failure
    },

  });

  return User;
});
