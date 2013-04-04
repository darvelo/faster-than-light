define(['backbone'], function (Backbone) {
  'use strict';

  var Task = Backbone.Model.extend({
    url: '/api/tasks'
  });

  return Task;
});
