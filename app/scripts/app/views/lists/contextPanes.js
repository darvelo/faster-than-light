define([
  'backbone',
  'core/config',
  'views/contextPane',
  'underscore',
],

function (Backbone, appConfig, ContextPaneView, _) {
  'use strict';

  var Contexts = Backbone.View.extend({
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

      this.listenTo(this.collection, 'pane:resize', this.savePaneSizes);
      this.listenTo(this.collection, 'destroy', this.render);
    },

    bootRender: function bootRender (renderFirst, renderLast, lastContexts) {
      // initialize the context panes in order, starting with center position -- this is critical
      _.each(appConfig.paneOrder, function (position) {
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

    savePaneSizes: function savePaneSizes (panePosition, paneSize) {
      var self = this,
          paneSizes = this.app.user.get('paneSizes') || {};

      // center doesn't have a size
      if (panePosition === 'center') {
        return;
      }

      // set local user model
      if (_.isNumber(paneSize)) {
        paneSizes[panePosition] = paneSize;
        this.app.user.set('paneSizes', paneSizes);
      }

      // if not waiting on other model resizes,
      // kick off waiting process, and when done, save user model
      if (!this.waitingOnResizes) {
        this.waitingOnResizes = true;

        setTimeout(function () {
          self.app.user.save();
          self.waitingOnResizes = false;
        }, 100);
      }
    },

  });

  return Contexts;
});
