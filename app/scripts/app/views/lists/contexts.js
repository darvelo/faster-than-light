define([
  'backbone',
  'views/lists/context',
],

function (Backbone, ContextListItem) {
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
      console.log('el', this.$el);

      this.collection.resort();
      this.collection.each(function (context) {
        var ContextView = new ContextListItem({ app: this.app, model: context });
        this.$el.append( ContextView.render().el );
      }, this);

      return this;
    },
  });

  return Contexts;
});
