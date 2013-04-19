define([
  'backbone',
  'core/config',
  'views/config/contextsLayout',
  'collections/projects',
  'views/project',
  'JST/contextPane',
  'underscore'
],

function (Backbone, appConfig, innerLayoutConfig, ProjectsCollection, ProjectView, template, _) {
  'use strict';

  var ContextPane = Backbone.View.extend({
    className: 'contextPane',

    template: template,

    events: {
      'takeCenterPane': 'takeCenterPane',
    },

    initialize: function initialize () {
      this.app = this.options.app;
      this.position = false;

      if (this.app.booting && this.options.position) {
        if (_.contains(this.options.lastContexts, this.model.get('id'))) {
          this.useBootstrap();
          this.addPane(this.options.position);
          this.options.position = null;
        } else {
          this.prepareData(function () {
            this.addPane(this.options.position);
            this.options.position = null;
          });
        }
      }

      // this.listenTo(this.model, 'change:projects', this.render);
      this.listenTo(this.model, 'add:pane', this.prepareData);
      this.listenTo(this.model, 'remove:pane', this.removePane);
      this.listenTo(this.model, 'change:title', function (model) { console.log('model title changed -- paneview', this.$el); this.render() });
    },

    prepareData: function prepareData (callback) {
      // callback used on boot
      if (callback) {
        this.useServer(callback);
        return;
      }

      this.useServer(function () {
        this.addPane();
      });
    },

    render: function render () {
      this.$el
        .data({ id: this.model.get('id') })
        .empty()
        .html(template(this.model.toJSON()));

      return this;
    },

    renderProjects: function renderProjects () {
      this.model.projects.each(function (project) {
        var projectView = new ProjectView({ app: this.app, model: project });

        this.$el.append(projectView.render().el);
      }, this);
    },

    useBootstrap: function useBootstrap () {
      var allProjects = this.app.collections.projects,
          ownProjects = [],
          isActive;

      isActive = _.contains(this.options.lastContexts, this.model.get('id'));
      if (isActive) {
        _.each(this.model.get('projects'), function (projectId) {
          ownProjects.push(allProjects.get(projectId));
        }, this);

        this.model.projects.reset(ownProjects);
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
          callback.call(self);
        },
      });

    },

    findFreePane: function findFreePane () {
      var panes = this.app.innerLayout.panes,
          priority = appConfig.paneOrder.slice(1),
          newPosition;

      newPosition = _.find(priority, function (position) {
        return !panes[position];
      });

      return newPosition;
    },

    findCenterPaneReplacement: function findCenterPaneReplacement () {
      var panes = this.app.innerLayout.panes,
          priority = appConfig.paneOrder.slice(1),
          replacementPosition;

      replacementPosition = _.find(priority, function (position) {
        return panes[position];
      });

      return panes[replacementPosition]; // will return undefined if non-existent
    },

    takeCenterPane: function takeCenterPane () {
      this.position = 'center';
      this.$el
        .removeClass()
        .addClass('ui-layout-center')
        .addClass(this.className);
    },

    savePaneOrder: function savePaneOrder () {
      if (this.app.booting) {
        return;
      }

      var panes = this.app.innerLayout.panes,
          paneModelIds = {};

      if (!panes) {
        this.app.user.set('lastContexts', paneModelIds);
        this.app.user.save();
        return;
      }

      _.each(appConfig.paneOrder, function (position) {
        if (panes[position]) {
          paneModelIds[position] = panes[position].data('id');
          return;
        }

        delete paneModelIds[position];
      });

      console.log('paneModelIds', paneModelIds);
      this.app.user.set('lastContexts', paneModelIds);
      this.app.user.save();
    },

    addPane: function addPane (bootingPosition) {
      var position,
          positionClass;

      if (bootingPosition) { // undefined if not booting
        position = bootingPosition;
      } else if (!this.app.innerLayout) {
        position = 'center';
      } else {
        position =  this.findFreePane();
      }

      if (!position) {
        alert('too many panes filled! free up some space');
        return;
      }

      this.position = position;
      positionClass = 'ui-layout-' + this.position;

      this.$el
        .removeClass()
        .addClass(positionClass)
        .addClass(this.className);

      this.render();
      this.renderProjects();
      this.$el.appendTo(this.app.$contextsPanes);

      if (!this.app.innerLayout) {
        this.app.innerLayout = this.app.$contextsPanes.layout(innerLayoutConfig);
      } else {
        this.app.innerLayout.addPane(this.position);
      }

      this.app.$contextsPanes.addClass('active');
      this.savePaneOrder();
      this.model.trigger('change:active');
    },

    removePane: function removePane () {
      var replacementPane;

      // check to make sure it's actually an active pane
      if (this.$el.parent().attr('id') === 'inactiveContexts') {
        return;
      }

      this.$el.appendTo( this.app.$inactiveContexts );

      if (this.position === 'center') {
        replacementPane = this.findCenterPaneReplacement();
        this.app.innerLayout.destroy();
        this.app.innerLayout = false;

        if (replacementPane) {
          replacementPane.trigger('takeCenterPane');
          this.app.innerLayout = this.app.$contextsPanes.layout(innerLayoutConfig);
        } else {
          this.app.$contextsPanes.removeClass('active');
        }

      } else {
        this.app.innerLayout.removePane(this.position);
      }

      // destroy the layout and recreate it, removing the center and repositioning the rest as best you can

      this.savePaneOrder();
      this.model.trigger('change:inactive');
    },

  });

  return ContextPane;
});
