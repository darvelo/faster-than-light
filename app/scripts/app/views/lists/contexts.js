define([
  'views/base',
  'views/context',
  'underscore',
],

function (BaseView, ContextListItemView, _) {
  'use strict';

  var Contexts = BaseView.extend({
    tagName: 'ul',
    className: 'contexts',

    events: {},

    initialize: function initialize (options) {
      this.app = options.app;

      // this needs to be registered before the TodoView's listenTo on the same event
      this.listenTo(this.app.collections.contexts, 'reset', this.render);

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
