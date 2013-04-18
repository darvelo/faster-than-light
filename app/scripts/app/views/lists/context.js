define([
  'backbone',
  'collections/projects',
  'views/contextPane',
  'JST/lists/context',
  'underscore',
],

function (Backbone, ProjectsCollection, ContextPaneView, template, _) {
  'use strict';

  var Context = Backbone.View.extend({
    tagName: 'li',
    className: 'context',

    template: template,

    events: {
      'click': 'toggleActive',
    },

    initialize: function initialize () {
      this.app = this.options.app;
      this.active = false;
      this.pane = {  // set when $el is clicked
        // position:
        // $el:
      };


      if (this.app.booting) {
        this.useBootstrap();
      }

      this.listenTo(this.model, 'change:projects', this.render);
      this.listenTo(this.model, 'change:pane', this.changePaneToCenter)
    },

    render: function render () {
      this.$el.append(template(this.model.toJSON()));

      return this;
    },

    renderPane: function renderPane () {
      var newPane = new ContextPaneView({ model: this.model });
      this.pane.$el = newPane.render().$el;

      if (this.active) {
        this.addPane();
      }
    },

    useBootstrap: function bootRender () {
      var allProjects = this.app.collections.projects,
          ownProjects = [];

      this.active = _.contains(this.app.user.get('lastContexts'), this.model.get('id'));
      if (this.active) {
        _.each(this.model.get('projects'), function (projectId) {
          console.log('adding ' + projectId, allProjects.get(projectId));
          ownProjects.push(allProjects.get(projectId));
        }, this);

        this.model.projects.reset(ownProjects);
        this.renderPane();
      }
    },

    useServer: function useServer (callback) {
      var allProjects = this.app.collections.projects,
          allTasks = this.app.collections.tasks,
          tempCollection = new ProjectsCollection([], { url: this.model.projects.url }),
          ownProjects = [],
          auxProjects = [],
          self = this;

      tempCollection.parse = function parse (response) { return response.projects; };

      tempCollection.fetch({
        success: function fetchSuccess (collection, response, options) {
          console.log(collection, response, options);
          ownProjects = response.projects; // the parse() method in the Context model's ProjectCollection automatically merges with this subset
          auxProjects = response.auxProjects;

          allProjects.set( ownProjects.concat(auxProjects), { remove: false });
          allTasks.set( response.tasks, { remove: false });

          ownProjects = []; // clear to populate with project references from global ProjectsCollection
          tempCollection.each(function (project) {
            var projectId = project.get('id');

            ownProjects.push( self.app.collections.projects.get(projectId) );
          });

          self.model.projects.reset(ownProjects);

          callback();
        },
      });

    },

    findFreePane: function findFreePane () {
      var panes = this.app.innerLayout.panes;

      // priority
      if (!panes.center) { return 'center' ; }
      if (!panes.east)   { return 'east'   ; }
      if (!panes.south)  { return 'south'  ; }
      if (!panes.north)  { return 'north'  ; }
      if (!panes.west)   { return 'west'   ; }

      return false;
    },

    changePaneToCenter: function changePaneToCenter () {

    },

    addPane: function addPane () {
      var position =  this.findFreePane();
      if (!position) {
        alert('too many panes filled! free up some space');
        return;
      }

      this.pane.position = position;
      this.pane.$el.removeClass()
        .addClass('ui-layout-' + this.pane.position)
        .appendTo( $( this.app.outerLayout.options.center.paneSelector ) );

      try {
        this.app.innerLayout.addPane(this.pane.position);
      } catch (e) {

      }

      this.$el.addClass('active');
      this.active = true;
    },

    removePane: function removePane () {
      var otherPaneExists;

      // check to make sure it's actually an active pane
      if (this.pane.$el.parent().attr('id') === 'inactiveContexts') {
        return;
      }

      // destroy the layout and recreate it, removing the center and repositioning the rest as best you can
      if (this.pane.position === 'center') {
        otherPaneExists = _.find(this.app.innerLayout.panes, function (value, key) {
          return !!value;
        });
        console.log('key', otherPaneExists);
        return ;
      }

      try {
        this.app.innerLayout.removePane(this.pane.position);
      } catch (e) {

      }

      this.pane.$el.appendTo( $('#inactiveContexts') );
      this.$el.removeClass('active');
      this.active = false;
    },

    toggleActive: function toggleContext (e) {
      var self = this;

      if (this.active) {
        this.removePane();
      } else {
        this.useServer(function () {
          if (self.pane.$el) {
            self.removePane();
            self.pane.$el.remove();
            self.pane = {};
          }

          self.renderPane();
          self.addPane();
        });
      }



      // save lastContext to user
      // trigger $.layout of view
      //  -- figure out which panes are active and set the right one
      //  -- if none are active (if layout doesn't exist), you have to create it and set the center pane
    },

  });

  return Context;
});
