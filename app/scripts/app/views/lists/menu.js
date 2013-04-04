define([
  'backbone',
  'views/lists/menuItem'
],

function (Backbone, ListMenuItemView) {
  'use strict';

  var ListMenuView = Backbone.View.extend({
    el: '.sidebar-nav',
    tagName: 'ul',
    // TODO: check if these classes are needed
    className: 'nav nav-list lists-nav',

    events: {},

    initialize: function(){
      this.listenTo(this.collection, 'add', this.render);
      this.listenTo(this.collection, 'reset', this.render);
    },

    renderListItem: function(item){
      var itemView = new ListMenuItemView({
        model: item
      });
      this.$el.append(itemView.render().el);

      return this;
    },

    render: function(){
      this.$el.empty();

      this.collection.each(function(listItem) {
        this.renderListItem(listItem);
      }, this);

      return this;
    }
  });

  return ListMenuView;
});
