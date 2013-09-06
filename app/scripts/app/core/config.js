define([
  'jquery',
  'jqueryui',
  'jqueryui-layout',
  'backbone',
  'json3',
  'socket.io',
  'core/errorlog',
  'underscore',
],

function ($, $ui, $layout, Backbone, JSON3, socket, errlog, _) {
  'use strict';

  var app;
  var paneConfig = {
    paneOrder: ['center', 'south', 'west', 'north', 'east'],
    replacementPaneOrder: ['east', 'west', 'north', 'south'],
  };

  // remove jQuery and $ from the global scope.
  // all modules will use AMD to get $
  // $.noConflict(true);
  // Backbone.$ = $;
  console.log('TODO: Make jQuery noConflict and Backbone.$ reference AMD jQuery');

  function csrfSafeMethod (method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/).test(method);
  }

  function modifyBackboneSync () {
    var oldSync = Backbone.sync,
        csrfToken = window.bootstrap && window.bootstrap.csrf;

    if (csrfToken) {
      // have to rewrite Backbone.sync with Anti-CSRF token provided on bootstrap
      Backbone.sync = function(method, model, options) {
        options = options || {};

        var oldBeforeSend = options.beforeSend || function () {};
        var oldSuccess = options.success || function () {};

        var newOptions = _.extend(options, {
          crossDomain: false, // ensures CSRF token isn't sent to other domains
          beforeSend: function (xhr) {
            // performing a CSRF check even on safe methods can
            // prevent users from being tricked into providing a
            // malicious third party with sensitive (JSON) data
            // if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader('X-CSRF-Token', csrfToken);
            // }
            return oldBeforeSend(xhr);
          },

          success: function (data, textStatus, jqXHR) {
            if (method !== 'read') {
              app.socket.emit('backboneREST', {
                url: this.url,
                method: this.type,
                // data: this.data, // not safe to trust data from client
              });
            }

            return oldSuccess(data, textStatus, jqXHR);
          },
        });

        return oldSync(method, model, newOptions);
      };
    }
  }

  function init (_app) {
    app = _app;

    modifyBackboneSync();

    return {
      paneConfig: paneConfig,
    };
  }

  return init;
});
