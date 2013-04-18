define([
  'backbone',
  'JST/todos',
  'views/lists/contexts',
  'views/config/todosLayout',
  'views/config/contextsLayout',
],

function (Backbone, template, ContextListItem, outerLayoutConfigGen, innerLayoutConfig) {
  'use strict';

  var TodosView = Backbone.View.extend({
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
      this.app.outerLayout = this.$el.layout(outerLayoutConfig);
      this.app.innerLayout = this.$el.find('.contextsPanes').layout(innerLayoutConfig);

      var ContextView = new ContextListItem({ app: this.app, collection: this.app.collections.contexts });

      return this;
    },
  });

  return TodosView;
});
