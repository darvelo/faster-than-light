define(['backbone'], function (Backbone) {
  'use strict';

  var TaskList = Backbone.Model.extend({
    url: '/api/contexts'
  });

  return TaskList;
});
