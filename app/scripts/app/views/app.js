define([
  'backbone',
  'JST/app',
],

function(Backbone, template) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: '#todos-app',
    template: template,

    events: {
    },

    initialize: function() {
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return AppView;
});

