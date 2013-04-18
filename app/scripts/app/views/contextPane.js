define([
  'backbone',
  'JST/contextPane',
  'underscore'
],

function (Backbone, template, _) {
  'use strict';

  var ContextPane = Backbone.View.extend({
    className: 'contextPane',

    template: template,

    initialize: function initialize () {

    },

    render: function render () {
      this.$el.html(template({
        projects: this.model.projects.toJSON(),
        context: this.model.toJSON(),
      }));

      return this;
    },

  });

  return ContextPane;
});
