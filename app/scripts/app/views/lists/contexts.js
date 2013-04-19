define([
  'backbone',
  'core/config',
  'views/context',
  'underscore',
],

function (Backbone, appConfig, ContextListItemView, _) {
  'use strict';

  var Contexts = Backbone.View.extend({
    el: '.contexts',

    events: {},

    initialize: function initialize () {
      this.app = this.options.app;
      this.render();

      this.listenTo(this.collection, 'destroy', this.render);
    },

    render: function render () {
      this.collection.resort();
      this.collection.each(function (context) {
        var ContextListItem = new ContextListItemView({ app: this.app, model: context });
        this.$el.append( ContextListItem.render().el );
      }, this);

      return this;
    },
  });

  return Contexts;
});
