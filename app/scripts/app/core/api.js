define([
  'backbone',
  'underscore',
],

function (Backbone, _) {
  'use strict';

  function ApiManager(_app) {
    this.init();
  }

  _.extend(ApiManager.prototype, Backbone.Events);

  // To test if the API can connect (originally for auth to Google's servers)
  // Not sure if this is needed in my isolated implementation
  ApiManager.prototype.init = function () {
    var self = this;

    setTimeout(function () {
      self.trigger('ready');
    }, 1000);
  };

  return ApiManager;
});
