define([
  'views/base',
  'views/lists/menuItem'
],

function (BaseView, ListMenuItemView) {
  'use strict';

  var ListMenuView = Backbone.View.extend({
    el: '.sidebar-nav',
    tagName: 'ul',
    // TODO: check if these classes are needed
    className: 'nav nav-list lists-nav',

    events: {
      'dblclick a': 'test',
      'contextmenu a': 'cntx',
    },

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
    },

    test: function (e) {
      console.log('doubleclick');
    },

    cntx: function contextMenu (e) {
      console.log('contextmenu');
      e.preventDefault();
      e.stopPropagation();
    }
  });

  return ListMenuView;
});
