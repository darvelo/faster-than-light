define([
  'backbone',
  'collections/projects',
  'core/validators/index',
  'underscore',
],

function (Backbone, ProjectsCollection, validators, _) {
  'use strict';

  var Context = Backbone.Model.extend({
    urlRoot: '/api/contexts', // needed to override the nested collections' url properties

    initialize: function initialize () {
      this.projects = new ProjectsCollection([], {
        url: '/api/batch/context/' + this.get('id'),
        comparatorItem: 'order',
        parse: function parse (response) {
          return response.projects;
        },
      });
      this.listenTo(this.projects, 'add', this.projectAdd);
    },

    validate: validators.context,

    projectAdd: function (project) {
      var projects = this.get('projects'),
          newProjectId = project.get('id');

      if (! _.contains(projects, newProjectId) ) {
        this.set('projects', projects.push(newProjectId));
      }

      console.log('project added!');
      this.save();
      // this.trigger('add:project', [this.get('_id'), project]);
    },
  });

  return Context;
});
