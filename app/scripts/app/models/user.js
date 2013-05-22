define([
  'backbone',
  'core/validators/index',
  'underscore',
],

function (Backbone, validators, _) {
  'use strict';

  var User = Backbone.Model.extend({
    url: '/api/users/me',
    defaults: {

    },

    validate: validators.user,

  });

  return User;
});
