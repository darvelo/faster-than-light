define([
  'collections/tasks',
  'views/base',
  'templates/task',
  'jquery',
  'underscore',
],

function (TasksCollection, BaseView, template, $, _) {
  'use strict';

  var TaskView = BaseView.extend({
    tagName: 'div',
    className: 'task',

    template: template,

    events: {},

    initialize: function initialize (options) {
      this.app = options.app;

      this.dependents = new TasksCollection([]);
      this.followers = new TasksCollection([]);
      this.generateCollections();

    },

    render: function render () {

    },

    generateCollections: function generateCollections () {
      this.model.children
    },
  });

  return TaskView;
});
