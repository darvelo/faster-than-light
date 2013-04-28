define([
  'core/config',
  'JST/todos',
  'views/base',
  'views/lists/contextPanes',
  'views/lists/contexts',
  'views/config/todosLayout',
  'underscore',
],

function (appConfig, template, BaseView, ContextPanes, ContextList, outerLayoutConfigGen, _) {
  'use strict';

  var TodosView = BaseView.extend({
    el: '.todos',

    template: template,

    events: {

    },

    initialize: function initialize (_app) {
      console.log('app', _app);
      this.app = _app;
    },

    render: function render () {
      var outerLayoutConfig = outerLayoutConfigGen('.contextsList', '.contextsPanes');
      this.$el.html(template());
      this.app.$inactiveContexts = $('#inactiveContexts');
      this.app.$contextsPanes = $('.contextsPanes');
      this.app.outerLayout = this.$el.layout(outerLayoutConfig);

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
  });

  return TodosView;
});
