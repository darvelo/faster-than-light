define([
  'views/base',
  'JST/project',
  'underscore',
],

function (BaseView, template, _) {
  'use strict';

  var ProjectView = BaseView.extend({
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
