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

      this.listenTo(this.app, 'todos:init', this.initLayout);
      this.listenTo(this.app.collections.contexts, 'reset', this.renderLayout);
      // might be useful?
      this.listenTo(this.app, 'todos:saveLayout', this.saveLayoutSettings);
    },

    render: function render () {
      this.$el.html(template());

      return this;
    },

    initLayout: function initLayout () {
      /*
       * Render Main Todos Layout and Context Panes Layout
       */
      var outerLayoutConfig = outerLayoutConfigGen('outer-pane', '.contextsList', '.contextsPanes');
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
      this.app.innerLayout = this.$('.contextsPanes').layout(innerLayoutConfig);


      /*
       * Render ContextsList sidebar contents container
       */
      this.subViews['contextsList'] = new ContextList({ app: this.app, collection: this.app.collections.contexts });
      this.$('.contextsList').append( this.subViews['contextsList'].$el );


      return this;
    },

    renderLayout: function renderLayout () {
      var outerLayout = this.app.outerLayout;
      var innerLayout = this.app.innerLayout;

/*    OLD CODE
      var lastContexts = this.app.user.get('lastContexts'),
          renderingLists;

      // render contexts in order so panes are opened the way they were last login
      if (this.app.booting && ! _.isEmpty(lastContexts)) {
        renderingLists = this.getRenderingLists(lastContexts);
      }

      new ContextList({ app: this.app, collection: this.app.collections.contexts });
      new ContextPanes({
        app: this.app,
        collection: this.app.collections.contexts,
        renderingLists: renderingLists,
      });
*/
      return this;
    },

    getRenderingLists: function getRenderingLists (lastContexts) {
      var lastContextsIds, // gonna filter by the id value later
          renderFirst = {}, // object because ids will be referenced by position (value)
          renderLast = [];


      // get the order in which the ContextPanes should be rendered

      lastContextsIds = _.invert(lastContexts);

      this.app.collections.contexts.each(function (context) {
        var contextId = context.get('id'),
            found = _.has(lastContextsIds, contextId);

        if (found) {
          // some trickery to get the object to look like: { position: contextObject }
          renderFirst[ lastContextsIds[contextId] ] = context;
        } else {
          renderLast.push(context);
        }
      }, this);

      return {
        first: renderFirst,
        last: renderLast,
        lastContexts: _.values(lastContexts),
      };
    },

    // _.debounce will keep the context to the view.
    // i use it here to prevent multiple saves to the server
    // in the case of many resize/close events happening in succession
    saveLayoutSettings: _.debounce(function saveLayoutSettings (e, a , bb, c) {

      /*console.log('resizing..',e, a , bb, c);
      console.log($(e.target));
      return;
      */

      var app = this.app;
      var outerLayout = this.app.outerLayout;
      var innerLayout = this.app.innerLayout;

      // .set() only the attrs we need to
      var tmpUser = {};
      tmpUser.menu = {},
      tmpUser.lastContexts = {},
      tmpUser.paneSizes = {},

      // set menu size and state
      tmpUser.menu.size = outerLayout.west.state.size;
      tmpUser.menu.isClosed = outerLayout.west.state.isClosed;

      _.each(['north', 'south', 'east', 'west'], function (position) {
        if (!innerLayout[position].state.isClosed) { // && this.contextMap[position]) {
          // get the context id that's inside the open pane using the local model map
          // tmpUser.lastContexts[position] = this.contextMap[position].get('id');
        }

        tmpUser.paneSizes[position] = innerLayout[position].state.size;
      }, this);

      var jqXHR = this.app.user.save(tmpUser);

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
