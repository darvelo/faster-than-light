define([
  'backbone',
  'underscore',
],

function (Backbone, _) {
  'use strict';

  var oldSync = Backbone.sync,
      csrfToken = window.bootstrap.csrf;

  if (csrfToken) {
    // have to rewrite Backbone.sync with Anti-CSRF token provided on bootstrap
    Backbone.sync = function(method, model, options) {
      options = options || {};

      var oldBeforeSend = options.beforeSend || function () {};

      var newOptions = _.extend(options, {
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRF-Token', csrfToken);
          return oldBeforeSend(xhr);
        },
      });

      return oldSync(method, model, newOptions);
    };

  }

  return {
    paneOrder: ['center', 'south', 'west', 'north', 'east'],
    replacementPaneOrder: ['east', 'west', 'north', 'south'],
  };
});
