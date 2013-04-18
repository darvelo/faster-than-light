define([
  'backbone',
  'collections/tasks',
  'underscore',
],

function (Backbone, TasksCollection, _) {
  'use strict';

  var Project = Backbone.Model.extend({
    urlRoot: '/api/projects', // needed to override the nested collections' url properties
    initialize: function initialize () {
      this.rootTasks = new TasksCollection([], {
        // url: '/api/batch/project/' + this.get('id'),
        comparatorItem: 'order',
      });
      this.listenTo(this.rootTasks, 'add', this.rootTaskAdd);
    },

    rootTaskAdd: function (task) {
      var rootTasks = this.get('rootTasks'),
          newTaskId = task.get('id');

      if (! _.contains(rootTasks, newTaskId) ) {
        this.set('rootTasks', rootTasks.push(newTaskId));
      }

      console.log('task added!');
      this.save();
      // this.trigger('add:project', [this.get('_id'), project]);
    },
  });

  return Project;
});
