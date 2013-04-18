define([
  'backbone',
  'JST/app',
],

function(Backbone, template) {
  'use strict';

  var AppView = Backbone.View.extend({
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

