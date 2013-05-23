define([
  'JST/todos',
  'views/base',
  'views/lists/contextPanes',
  'views/lists/contexts',
  'views/config/todosLayout',
  'views/config/contextsLayout',
  'jquery',
  'underscore',
],

function (template, BaseView, ContextPanes, ContextList, outerLayoutConfigGen, innerLayoutConfigGen, $, _) {
  'use strict';

  var TodosView = BaseView.extend({
    el: '.todos',

    template: template,

    events: {
      'paneResize': 'saveLayoutSettings',
      'paneClose': 'saveLayoutSettings',
    },

    initialize: function initialize (options) {
      this.app = options.app;

      this.subViews = {};

      // used to store information about which
      // context occupies which inner layout pane
      this.contextMap = {};
    },

    addListeners : function addListeners () {
      this.listenTo(this.app, 'todos:init', this.initLayout);
      this.listenTo(this.app.collections.contexts, 'reset', this.renderLastContexts);
      this.listenTo(this.app.collections.contexts, 'context:activate', this.createContextTodo);
      this.listenTo(this.app.collections.contexts, 'context:deactivate', this.removeContextTodo);
      this.listenTo(this.app.collections.contexts, 'destroy', this.removeContextTodo);
      // might be useful?
      this.listenTo(this.app, 'todos:saveLayout', this.saveLayoutSettings);
    },

    render: function render () {
      this.$el.html(template());

      /*
       * Render ContextList sidebar contents container
       */
      this.subViews.contextList = new ContextList({ app: this.app, collection: this.app.collections.contexts });

      // listeners for this view need to be added after the listeners
      // for the contextList view because that view needs to respond
      // to the global contexts collection 'reset' event before this does
      this.addListeners();

      return this;
    },

    initLayout: function initLayout () {
      /*
       * Render Main Todos Layout and Context Panes Layout
       */
      var outerLayoutConfig = outerLayoutConfigGen('outer-pane', '.contextList', '.contextPanes');
      var innerLayoutConfig = innerLayoutConfigGen('inner-pane', '.activateAContext');

      var menu = this.app.user.get('menu') || {};
      var paneSizes = this.app.user.get('paneSizes') || {};

      // set up layout with last user settings if they exist.
      // this needs to be done before initializing the layout with $el.layout(settings)
      outerLayoutConfig.west.size = menu.size || outerLayoutConfig.west.size;
      outerLayoutConfig.west.initClosed = menu.isClosed || outerLayoutConfig.west.initClosed;

      /*
       * Set up the user's last known pane size settings if they exist.
       * Init all panes to closed in config. The contexts collection will trigger
       * the active state on itself which the innerLayout $el will listenTo.
       */
      _.each(['north', 'south', 'east', 'west'], function (position) {
        if (paneSizes[position]) {
          innerLayoutConfig[position].size = paneSizes[position];
        }
      }, this);

      this.app.outerLayout = this.$el.layout(outerLayoutConfig);
      this.app.innerLayout = this.$('.contextPanes').layout(innerLayoutConfig);

      this.$('.contextList').append( this.subViews.contextList.render().$el );

      return this;
    },

    renderLastContexts: function renderLastContexts () {
      var outerLayout = this.app.outerLayout;
      var innerLayout = this.app.innerLayout;
      var lastContexts = this.app.user.get('lastContexts');
      var paneConfig = this.app.config.paneConfig;
      var paneOrder = paneConfig.paneOrder;


      // remove any views that are in the context panes before rerendering lastcontexts
      _.each(this.contextMap, function (position, contextId) {
        var contextModel = this.app.collections.contexts.get(contextId);

        // remove it all just to be safe
        if (!contextModel) {
          innerLayout.panes[position].empty();
          delete this.contextMap[contextId];
          return;
        }

        contextModel.trigger('context:deactivate', contextModel);
      }, this);


      // render contexts in order so panes are opened the way they were last login
      _.each(lastContexts, function (contextId, position) {
        var contextModel = this.app.collections.contexts.get(contextId);

        if (!contextModel) {
          // this will cause the 'context:activate' event to be sent back to us later
          this.app.collections.contexts.trigger('fetch:lastContext', contextId, position);
          return;
        }

        contextModel.trigger('context:activate', contextModel, position);
      }, this);

      return this;
    },

    createContextTodo: function createContextTodo (contextModel, /* optional */ position) {
      var id = contextModel.get('id');

      var nextPane;
      var innerLayout = this.app.innerLayout;
      var cachedView = this.app.views.contextViews[id];

      var takenPanes = _.values(this.contextMap);
      var takenPanesByPosition = _.invert(this.contextMap);;

      var paneConfig = this.app.config.paneConfig;
      var paneOrder = paneConfig.paneOrder;
      var replacementPaneOrder = paneConfig.replacementPaneOrder;
      var replacementPanePosition = replacementPaneOrder[0];
      var replacementId;
      var replacementModel;

      // if the context $el is in an already open pane
      if (this.contextMap[id]) {
        return;
      }

      if (!position) {
        // get the first open pane position (south, east, etc.)
        nextPane = _.difference(paneOrder, takenPanes)[0];
      }

      if (position && !takenPanesByPosition[position]) {
        nextPane = position;
      }

      // deactivate a pane that's taken, activate the pane with the new context
      if (!nextPane) {
        replacementId = takenPanesByPosition[replacementPanePosition];
        replacementModel = this.app.collections.contexts.get(replacementId);
        replacementModel.trigger('context:deactivate', replacementModel);
        nextPane = replacementPanePosition;
      }

      // if the contextView already exists in the app's views cache,
      // move the element to the next open pane and toggle that pane open
      if (!cachedView) {
        contextModel.trigger('context:renderTodos', contextModel);
        cachedView = this.app.views.contextViews[id];
      }

      this.contextMap[id] = nextPane;
      innerLayout.panes[nextPane].html( cachedView.el );

      // open pane if it's closed
      if (innerLayout[nextPane].state.isClosed) {
        innerLayout.toggle(nextPane);
      }

      this.$('.contextPanes').addClass('active');
      contextModel.trigger('context:active', contextModel);

      this.saveLayoutSettings();
      return this;
    },

    removeContextTodo: function removeContextTodo (contextModel) {
      var id = contextModel.get('id');
      var innerLayout = this.app.innerLayout;
      var paneCount;


      // if the context isn't in an open pane
      if (!this.contextMap[id]) {
        return;
      }

      if (this.contextMap[id] !== 'center') {
        innerLayout.toggle(this.contextMap[id]);
        delete this.contextMap[id];
        return;
      }

      // have to replace the center pane with another contextView to make it seamless


      paneCount = _.reduce(this.contextMap, function (memo, val) { return memo + (!!val ? 1: 0); }, 0);
      if (paneCount === 0) {
        this.$('.contextPanes').removeClass('active');
      }

      delete this.contextMap[id];
      contextModel.trigger('context:inactive', contextModel);

      this.saveLayoutSettings();
      return this;
    },

    // _.debounce will keep the context to the view.
    // i use it here to prevent multiple saves to the server
    // in the case of many resize/close events happening in succession
    saveLayoutSettings: _.debounce(function saveLayoutSettings () {
      var app = this.app;
      var outerLayout = this.app.outerLayout;
      var innerLayout = this.app.innerLayout;
      var takenPanesByPosition = _.invert(this.contextMap);
      var paneConfig = this.app.config.paneConfig;
      var paneOrder = paneConfig.paneOrder;

      // .set() only the attrs we need to
      var tmpUser = {};
      tmpUser.menu = {},
      tmpUser.lastContexts = {},
      tmpUser.paneSizes = {},

      // set menu size and state
      tmpUser.menu.size = outerLayout.west.state.size;
      tmpUser.menu.isClosed = outerLayout.west.state.isClosed;

      _.each(paneOrder, function (position) {
        if (takenPanesByPosition[position]) {
          tmpUser.lastContexts[position] = takenPanesByPosition[position];
        }

        // center has no size
        if (position !== 'center') {
          tmpUser.paneSizes[position] = innerLayout[position].state.size;
        }
      }, this);

      var jqXHR = this.app.user.save(tmpUser);


      console.log('TODO: do something to show the user the jqXHR error');
      // validation failed
      if (!jqXHR ) {
        // do something to show the user the error
        // this.app.user.validationError instanceof errorTypes.ValidationError ( don't necessarily need to check that )
        return;
      }

      function ajaxSuccess (data, textStatus, jqXHR) {

      }

      function ajaxFail (jqXHR, textStatus, errorThrown) {
        app.user.set(app.user.previousAttributes());
      }

      function ajaxAlways (dataOrjqXHR, textStatus, jqXHROrErrorThrown) {}

      jqXHR
        .done(ajaxSuccess)
        .fail(ajaxFail)
        .always(ajaxAlways);

    }, 600),
  });

  return TodosView;
});
