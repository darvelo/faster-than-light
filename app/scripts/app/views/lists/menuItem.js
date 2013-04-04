define([
  'backbone',
  'JST/lists/menuItem',
],

function (Backbone, template) {
  'use strict';

  var ListMenuItemView = Backbone.View.extend({
    tagName: 'li',
    className: 'list-menu-item',

    template: template,

    events: {
      'key': 'open',
    },

    initialize: function(){
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function(){
      this.$el.data('listId', this.model.get('id'));
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    open: function(){
      return false;
    }
  });

  return ListMenuItemView;
});
