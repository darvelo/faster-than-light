define([
  'views/base',
  'JST/app',
],

function (BaseView, template) {
  'use strict';

  var AppView = BaseView.extend({
    id: 'container',
    template: template,

    events: {
    },

    initialize: function() {
    },

    render: function() {
      this.$el.html(this.template());
      $('body').prepend(this.$el);
      return this;
    }
  });

  return AppView;
});

