define([
  'core/errorlog',
  'models/context',
  'views/todo/contextTodo',
  'backbone',
  'jquery',
  'underscore',
],

function (errlog, ContextModel, ContextTodoView, Backbone, $, _) {
  'use strict';

  var app;

  function contextSave (contextModel) {
    contextModel.save()
      .fail(function () {
        var err;
        var errMessage;
        errMessage = 'new context could not be saved for contextId: ' + contextModel.get('id');

        err = new Error(errMessage);
        errlog(2, err);
      });
  }

  function removeContextTodoView (contextModel) {
    var contextId = contextModel.get('id');
    delete app.listsById.views.contextTodoViews[contextId];

    return app;
  }

  function contextRenderTodoView (contextModel) {
    var contextTodoView = new ContextTodoView({ app: app, model: contextModel });

    app.listsById.views.contextTodoViews[contextModel.get('id')] = contextTodoView.render();

    return app;
  }

  function fetchContextBatchAndActivate (contextId, position) {
    fetchContextBatch(contextId)
      .done(function () {
        var contextModel = app.collections.contexts.get(contextId);
        contextModel.trigger('context:activate', contextModel, position);
      });
  }

  function fetchContextBatch (contextId) {
    var fetchModel, fetchData;

    if (!app.collections.contexts.get(contextId)) {
      fetchModel = fetchContextModel(contextId);
    }

    fetchData = fetchContextData(contextId);

    var dfd = $.when(fetchModel, fetchData)
      .fail(function () {
        var err;
        var errMessage;
        errMessage = 'context batch operation could not be completed for contextId: ' + contextId + '.';

        err = new Error(errMessage);
        errlog(2, err);
      });

    return dfd;
  }

  function fetchContextModel (contextId) {
    var contextModel = new ContextModel({ id: contextId });

    var dfd = contextModel.fetch()
      .done(function (data) {
        // add model to the global contexts collection
        app.collections.contexts.add(contextModel);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        var err;
        var errMessage;
        errMessage = 'context model could not be fetched for contextId: ' + contextId + '.';
        errMessage += ' Error was ' + errorThrown + '.';

        err = new Error(errMessage);
        errlog(2, err);
      });

    return dfd;
  }

  function fetchContextData (contextId) {
    // Using Backbone so that the CSRF Token
    // gets sent along with the AJAX request
    var dataProxy = new Backbone.Model();
    dataProxy.url = '/api/batch/context/' + contextId;
    dataProxy.parse = function (response, options) {
      // merge no attritubes into this throwaway model
      return {};
    };

    var dfd = dataProxy.fetch()
      .done(function (data) {
        // data should be all data associated with the contextId:
        // projects, auxProjects, and tasks
        app.data.merge(data);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        var err;
        var errMessage;
        errMessage = 'context batch data could not be fetched for contextId: ' + contextId + '.';
        errMessage += ' Error was ' + errorThrown + '.';

        err = new Error(errMessage);
        errlog(2, err);
      });

    return dfd;
  }

  function teardownContextTodoViews () {
    _.each(app.listsById.views.contextTodoViews, function (view, contextId) {
      view._teardown();
    }, app);

    app.listsById.views.contextTodoViews = {};
  }

  function init (_app) {
    app = _app;

    return {
      contextSave: contextSave,
      removeContextTodoView: removeContextTodoView,
      contextRenderTodoView: contextRenderTodoView,
      fetchContextBatchAndActivate: fetchContextBatchAndActivate,
      fetchContextBatch: fetchContextBatch,
      fetchContextModel: fetchContextModel,
      fetchContextData: fetchContextData,
      teardownContextTodoViews: teardownContextTodoViews,
    };
  }

  return init;
});
