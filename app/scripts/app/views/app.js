define([
  'views/base',
  'JST/app',
  'jquery',
],

function (BaseView, template, $) {
  'use strict';

  var AppView = BaseView.extend({
    id: 'container',
    template: template,

    events: {
    },

    initialize: function(options) {
      this.app = options.app;
    },

    render: function() {
      this.$el.html(this.template());
      $('body').prepend(this.$el);
      return this;
    }
  });

  return AppView;
});

