define([
  'backbone',
  'jquery',
  'underscore',
],

function (Backbone, $, _) {
  'use strict';

  /**
   * Error severity chart:
   *
   *   severity 1: highest - fatal error, capable of taking down the application if unnoticed
   *   severity 2: high - an unexpected event was handled, but the app isn't truly functional
   *   severity 3: somewhat high - expected a different result but handled it
   *   severity 5: lowest  - low importance, fix when there is time available
   */

  /**
   * Rules:
   *  1. Assume your code will fail.
   *  2. Log errors to the server.
   *  3. You, not the browser, handle errors.
   *  4. Identify where errors might occur.
   *  5. Throw your own errors.
   *  6. Distinguish fatal vs. non-fatal.
   *  7. Provide a debug mode.
   */


  /**
   * Debug mode means:
   *  - try-catch should rethrow error
   *  - window.onerror should return false meaning..
   *  - allow the browser to handle the error
   */

  /**
   * Remember:
   *  - Status code 304 is also an "error" that should be handled wherever expecting 200.
   *  - Error messages can be returned from the server with 500 status code.
   *  - Always determine whether an error is fatal or not.. meaning that if it's fatal,
   *    use log along with a user alert and application reload process (such as a page refresh).
   */

  var debugMode = true;
  console.log('TODO: turn off debug mode in the error handler when in production');
  console.log('TODO: create a better error message for the user when window.onerror executes without debugMode');

  var url = '/api/errlog';
  var AppError = Backbone.Model.extend({
    url: url,
  });

  function disableApp () {
    $('body').html('This page has encountered an error. Please refresh and try again.');
  }

  function ajaxSuccess () {}
  function ajaxFail () {}

  function sendError (errModel) {
    var jqXHR;

    // backbone error model
    if (errModel instanceof AppError) {
      jqXHR = errModel.save();
    // wtf?
    } else {
      createError(1, new Error('error type was not a proper type for the error handler'));
      return;
    }

    jqXHR.then(ajaxSuccess).fail(ajaxFail);

    if (!debugMode && errModel.get('severity') === 1) {
      disableApp();
    }

    return jqXHR;
  }


  function createError (severity, msg, line) {
    // an array of errors will send one error for each
    if (_.isArray(msg)) {
      _.each(msg, function (error) {
        // the array of errors may have an overarching message
        error.callerMessage = msg.callerMessage;
        createError(severity, error, line);
      });
      return;
    }

    // causes window.onerror to catch errors instead of sending them to the server
    if (debugMode && msg instanceof Error) {
      throw msg;
    } else if (debugMode && _.isString(msg)) {
      throw new Error(msg);
    }

    // start preparing a Backbone Model of the error to send to the server
    var err = new AppError();

    if (! _.isNumber(severity)) {
      createError(1, new Error('severity was not specified for the error handler'));
      return;
    }

    if (! _.isString(msg) && ! msg instanceof Error) {
      createError(1, new Error('error message was the wrong format for the error handler'));
      return;
    }

    if (line && ! _.isNumber(line)) {
      createError(5, new Error('error line was not a number for the error handler'));
      return;
    }

    // set error properties
    err.set('severity', severity);

    if (line) {
      err.set('line', line);
    }

    if (_.isString(msg)) {
      err.set('message', msg);
    }

    // msg is an app-defined Error type
    if (msg instanceof Error) {
      // the Error 'message' property doesn't show up on object iteration
      if (msg.message) {
        err.set('message', msg.message);
      }

      // copy each Error property to the Backbone model
      _.each(msg, function (val, key) {
        if (_.has(msg, key)) {
          err.set(key, val);
        }
      });
    }

    return sendError(err);
  }

  // handle any errors that crop up during runtime and halt execution
  // http://dev.opera.com/articles/view/better-error-handling-with-window-onerror/
  //
  // be aware it doesn't catch everything. Even SyntaxErrors like 'throw,', 'thrownew Error("blah")',
  // or 'new }' will be uncaught and the browser will continue execution. Linting is important.
  window.onerror = function (msg, url, line) {
    // Allow the browser to handle the error
    if (debugMode) {
      // returning false means the browser will report
      // the error in console or in an alert to the user
      return false;

    // Log the error to the server and continue
    } else {
      createError(1, msg, line);
      disableApp();

      // returning true means the browser will not report
      // the error in console or in an alert to the user
      return true;
    }
  };

  return createError;
});
