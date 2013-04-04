define([
  'backbone',
  'models/tasklist',
],

function (Backbone, TaskList) {
  'use strict';

  var TaskLists = Backbone.Collection.extend({
    model: TaskList,
    url: '/api/contexts',
    comparator: 'order'
  });

  return TaskLists;
});
