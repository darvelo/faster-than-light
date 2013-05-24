define([
  'backbone',
  'underscore',
],

function (Backbone, _) {
  'use strict';

  var Task = Backbone.Model.extend({
    urlRoot: '/api/tasks', // needed to override the nested collections' url properties
    initialize: function initialize () {

      // TODO: put this in the view with this.model.dependents and so on...
/*      this.dependents = new TasksCollection([], {
        url: '/api/batch/task/' + this.get('id'),
        comparatorItem: 'order',
      });

      this.followers = new TasksCollection([], {
        url: '/api/batch/task/' + this.get('id'),
        comparatorItem: 'order',
      });

      this.listenTo(this.dependents, 'add', this.depChildAdd);
      this.listenTo(this.followers, 'add', this.folChildAdd);

*/
    },

    childAdd: function (task) {
      var children = this.get('appe'),
          newTaskId = task.get('id');

      if (! _.contains(children, newTaskId) ) {
        this.set('children', children.push(newTaskId));
      }

      console.log('task added!');
      this.save();
      // this.trigger('add:Task', [this.get('_id'), Task]);
    },
  });

  return Task;
});
