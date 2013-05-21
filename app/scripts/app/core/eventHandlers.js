define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  function contextDestroy (contextId) {
    delete this.views.contextViews[contextId];

    return this;
  }

  function init (_app) {
    return {
      contextDestroy: $.proxy(contextDestroy, _app),
    };
  }

  return init;
});
