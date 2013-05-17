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
   *   severity 1: highest - critical error capable of taking down the application if unnoticed
   *   severity 5: lowest  - low importance, fix when there is time available
   */

  var debugMode = true;
  console.log('TODO: turn off debug mode in the error handler when in production');
  console.log('TODO: create a better error message for the user when window.onerror executes without debugMode');

  var url = '/api/errlog';
  var AppError = Backbone.Model.extend({
    url: url,
  });

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

    return jqXHR;
  }


  function createError (severity, msg, line) {
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
      if (msg.message) { err.set('message', msg.message); }

      // copy each Error property to the Backbone model
      _.each(msg, function (val, key) {
        if (_.has(msg, key)) {
          err.set([key], val);
        }
      });
    }

    return sendError(err);
  }

  // handle any errors that crop up during runtime
  // http://dev.opera.com/articles/view/better-error-handling-with-window-onerror/
  //
  // be aware it doesn't catch everything. Even SyntaxErrors like 'throw,', 'thrownew Error("blah")',
  // or 'new }' will be uncaught and the browser will continue execution. Linting is important.
  window.onerror = function (msg, url, line) {
    // Allow the browser to handle the error
    if (debugMode) {
      // returning false means the browser will continue code execution
      return false;

    // Log the error to the server and continue
    } else {
      createError(1, msg, line);
      $('body').html('This page has encountered an error. Please refresh and try again.');

      // returning true means the browser will halt
      return true;
    }
  };

  return createError;
});
