define([
  'core/errorlog',
  'models/context',
  'views/lists/contextTodos',
  'jquery',
  'underscore',
],

function (errlog, ContextModel, ContextTodoView, $, _) {
  'use strict';

  function contextDestroy (contextId) {
    delete this.views.contextViews[contextId];

    return this;
  }

  function contextRenderTodos (contextModel) {
    this.views.contextViews[contextModel.get('id')] = new ContextTodoView({ app: this, model: contextModel });

    return this;
  }

  function fetchLastContext (contextId, position) {
    var contextModel = new ContextModel({ id: contextId });

    contextModel.fetch()
      .done(function () {
        this.collections.contexts.add(contextModel);
        contextModel.trigger('context:activate', contextId, position);
      })
      .fail(function () {
        var err;
        var errMessage;
        errMessage = 'context could not be fetched: ' + contextId;
        errMessage += position ? '. The position it was to be activated in was ' + position + '.' : '';

        err = new Error(errMessage);
        errlog(2, err);
      });
  }

  function init (_app) {
    return {
      contextDestroy: $.proxy(contextDestroy, _app),
      contextRenderTodos: $.proxy(contextRenderTodos, _app),
      fetchLastContext: $.proxy(fetchLastContext, _app),
    };
  }

  return init;
});
