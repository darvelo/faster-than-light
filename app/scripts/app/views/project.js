define([
  'backbone',
  'JST/project',
  'underscore',
],

function (Backbone, template, _) {
  'use strict';

  var ProjectView = Backbone.View.extend({
    className: 'project',

    template: template,

    events: {},

    initialize: function initialize () {
      this.app = this.options.app;



      // this.listenTo(this.model, 'change:projects', this.render);
      // this.listenTo(this.model, 'add:pane', this.addPane);
      // this.listenTo(this.model, 'remove:pane', this.removePane);
    },

    render: function render () {
      this.$el.html(template(this.model.toJSON()));

      console.log('roottasks', this.model.rootTasks);



      return this;
    }

  });

  return ProjectView;
});
