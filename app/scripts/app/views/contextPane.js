define([
  'core/config',
  'views/config/contextsLayout',
  'collections/projects',
  'views/base',
  'views/lists/projects',
  'JST/contextPane',
  'jquery',
  'underscore'
],

function (appConfig, innerLayoutConfig, ProjectsCollection, BaseView, ProjectsView, template, $, _) {
  'use strict';

  var ContextPane = BaseView.extend({
    className: 'contextPane',

    template: template,

    events: {
      'takeCenterPane': 'takeCenterPane',
      'paneResize': 'publishPaneResize',
      'paneClose': 'finishOtherPaneRemoval',
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

    renderContent: function renderContent () {
      var projectsView = new ProjectsView({ app: this.app, collection: this.model.projects });
      this.$el.append(projectsView.render().el);  // TODO: avoid reflow by attaching to a node that's not part of the DOM
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

      tempCollection.fetch().done(function (response, textStatus, jqXHR) {
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
          priority = appConfig.replacementPaneOrder,
          replacementPosition;

      replacementPosition = _.find(priority, function (position) {
        return panes[position];
      });

      // will return undefined if no non-center panes exist
      return replacementPosition && {
        $el: panes[replacementPosition],
        position: replacementPosition,
      };
    },

    takeCenterPane: function takeCenterPane () {
      this.position = 'center';
      this.$el
        .removeClass()
        .addClass('ui-layout-center')
        .addClass(this.className)
        .appendTo(this.$contextsPanes);
    },

    publishPaneResize: function publishPaneResize (e, paneType, paneSize) {
      this.app.user.saveLayoutSettings();
    },

    setPaneSize: function setPaneSize (position) {
      if (!this.app.innerLayout) {
        return;
      }

      var sizes = this.app.user.get('paneSizes');

      if ( _.isObject(sizes) && _.isNumber(sizes[position])) {
        this.app.innerLayout.options[position].size = sizes[position];
      }
    },

    addPane: function addPane (position) {
      var positionClass;

      if (!this.app.innerLayout) {
        position = 'center';
      } else {
        position = position || this.findFreePane();
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
      this.renderContent();
      this.$el.appendTo(this.app.$contextsPanes);

      if (!this.app.innerLayout) { // set up center position
        this.app.innerLayout = this.app.$contextsPanes.layout(innerLayoutConfig);
      } else {
        this.setPaneSize(position); // only need to set sizes for non-center. center takes up all space
        this.app.innerLayout.addPane(this.position);
      }

      this.app.$contextsPanes.addClass('active');
      this.app.user.saveLayoutSettings();
      this.model.trigger('change:active');
    },

    removePane: function removePane () {
      // check to make sure it's actually an active pane
      if (this.$el.parent().attr('id') === 'inactiveContexts') {
        return;
      }

      if (this.position === 'center') {
        this.finishCenterPaneRemoval();
      } else {
        this.app.innerLayout.close(this.position); // jQuery event calls finishOtherPaneRemoval when done
      }
    },

    // destroy the layout and recreate it, removing the center and repositioning the rest as best you can
    finishCenterPaneRemoval: function finishCenterPaneRemoval () {
      var self = this,
          replacementPane = this.findCenterPaneReplacement();

      // animating a pane with the Layout plugin is impossible.
      // it won't allow you to remove center panes and keep the layout intact,
      // so this is the next best thing
      this.$el.fadeOut(400, function () {
        var activePanePositions = _.chain(self.app.innerLayout.panes)
                            // return position for existent panes, undefined for nonexistent panes
                            .map(function (val, key, list) { if (!!list[key]) { return key; }})
                             // remove 'center' and pane to be switched
                            .difference(['center', replacementPane && replacementPane.position ])
                            .compact() // get rid of undefined's
                            .value();

        var activePanes = _.pick(self.app.innerLayout.panes, activePanePositions);

        // layouts without centers need to be destroyed
        self.app.innerLayout.destroy();
        self.app.innerLayout = false;

        // move current center pane out
        $(this).appendTo( self.app.$inactiveContexts );

        if (replacementPane) {
          replacementPane.$el.trigger('takeCenterPane');

          // move each non-center pane out
          _.each(activePanes, function ($el, position) {
            $el.appendTo(self.app.$inactiveContexts);
          });

          // reconstruct layout with only the new, replacement center pane inside
          self.app.innerLayout = self.app.$contextsPanes.layout(innerLayoutConfig);

          // re-add all non-center panes to the layout with their previous sizes
          _.each(activePanes, function ($el, position) {
            self.setPaneSize(position);
            $el.appendTo(self.app.$contextsPanes);
            self.app.innerLayout.addPane(position);
          });

        } else { // center pane was the only pane left
          self.app.$contextsPanes.removeClass('active');
        }

        self.app.user.saveLayoutSettings();
        self.model.trigger('change:inactive');
      });

    },

    // called when jQuery UI Layout plugin issues a callback with a jQuery event, 'paneClose'
    finishOtherPaneRemoval: function finishOtherPaneRemoval (e) {
      this.app.innerLayout.removePane(this.position);
      this.$el.appendTo( this.app.$inactiveContexts );
      this.app.user.saveLayoutSettings();
      this.model.trigger('change:inactive');
    },

  });

  return ContextPane;
});
