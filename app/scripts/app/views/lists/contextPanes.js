define([
  'views/base',
  'views/contextPane',
  'underscore',
],

function (BaseView, ContextPaneView, _) {
  'use strict';

  var Contexts = BaseView.extend({
    el: '.contextPanes',

    events: {},

    initialize: function initialize () {
      this.app = this.options.app;

      if (this.app.booting && this.options.renderingLists) {
        this.bootRender(this.options.renderingLists.first, this.options.renderingLists.last, this.options.renderingLists.lastContexts);

        // garbage collect
        this.options.renderingLists = null;
      } else {
        this.render();
      }

      this.listenTo(this.collection, 'destroy', this.render);
    },

    bootRender: function bootRender (renderFirst, renderLast, lastContexts) {
      // initialize the context panes in order, starting with center position -- this is critical
      _.each(this.app.config.paneConfig.paneOrder, function (position) {
        if (renderFirst[position]) {
          // ContextPanes render themselves
          var ContextPane = new ContextPaneView({
            app: this.app,
            model: renderFirst[position],
            position: position,
            lastContexts: lastContexts,
          });
        }
      }, this);

      _.each(renderLast, function (val, index) {
        var ContextPane = new ContextPaneView({ app: this.app, model: renderLast[index] });
        ContextPane.render();
      }, this);

      return this;
    },

    render: function render () {
      // render in order if either not booting or no lastContexts
      this.collection.each(function (context) {
        var ContextPane = new ContextPaneView({ app: this.app, model: context });

        ContextPane.render();
        // this.$el.append( ContextView.render().el );
      }, this);

      return this;
    },
  });

  return Contexts;
});
