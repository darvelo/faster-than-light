define([
  'socket.io',
  'core/config',
  'core/dataMethods',
  'core/transitions',
  'core/eventHandlers',
  'models/user',
  'collections/contexts',
  'collections/projects',
  'collections/tasks',
  'views/app',
  'views/todos',
  'routers/appRouter',
  'backbone',
  'underscore',
],

function(
  io,
  appConfig,
  appDataMethods,
  appTransitions,
  appEventHandlers,
  User,
  ContextsCollection,
  ProjectsCollection,
  TasksCollection,
  AppView,
  TodosView,
  AppRouter,
  Backbone,
  _
){
  'use strict';

  var App = function() {
    /*
     * Attach socket.io socket to app instance
     */
    this.socket = io.init(this);

    /*
     * App environment variables
     */
    this.config = appConfig(this);


    this.booting = true;


    this.initializeData();
    this.createViews();
    this.createRouter();

    /*
     * Easy app-wide URL navigation function
     */
    this.navigate = this.routers.appRouter.navigate;

    /*
     * Set up view transition animation functions
     */
    this.transition = appTransitions(this);

    /*
     * Get Event-handling functions the app will use to listenTo objects
     */
    this.eventHandlers = appEventHandlers(this);
    this.setupListeners();

    /*
     * Set up functions for app to manipulate its collections:
     * emptying them, fetching them from the server, or bootstrapping.
     * triggers a 'reset' event on each, which Backbone Views can listenTo
     */
    this.data = appDataMethods(this);

    /*
     * Trigger data reset and thus, Views' data population
     */
    this.data.bootstrap(window.bootstrap);



    Backbone.history.start({ pushState: true });


    this.booting = false;
    // this.connectApi();
  };

  App.prototype = {
    views: {},
    routers: {},
    models: {},
    collections: {},
    currentView: null,

    initializeData: function initializeData () {
      /*
       * Instantiate empty global models and collections that other,
       * local collections, and views, will reference once populated
       */
      this.models.user = this.user = new User(); // this.user is shorthand :)
      this.collections.contexts = new ContextsCollection([]);
      this.collections.projects = new ProjectsCollection([], { comparatorItem: 'id' });
      this.collections.tasks = new TasksCollection([], { comparatorItem: 'id' });
    },

    createViews: function createViews () {
      /*
       * Create empty views
       */
      this.views.app = new AppView();
      this.views.app.render();

      /*
       * Placeholder for cached Views of todo-list hierarchies by context id
       */
      this.views.contextViews = {};

      /*
       * ActionViews are main app contexts like: todo-list, calendar, statistics, settings, etc.
       */
      this.views.actionViews = {};
      this.views.actionViews.todos = new TodosView(this);
      this.views.actionViews.todos.render();
    },

    setupListeners: function setupListeners () {
      this.listenTo(this.collections.contexts, 'destroy', this.eventHandlers.contextDestroy);
    },

    createRouter: function createRouter () {
      /*
       * Create main router
       */
      this.routers.appRouter = new AppRouter({ app: this });
    },

/*    connectApi: function() {
      var self = this;

      this.apiManager = new ApiManager(this);
//      this.apiManager.on('ready', function(results) {
        if (window.bootstrap) {
          console.log('aaaaa!!');
          self.collections.lists.reset(window.bootstrap);
        } else {
          console.log('yoyoyo');
          self.collections.lists.fetch({
            data: { userId: '@me' },
            // success: function(collection, response, options) {
            //   //self.views.listMenu.render();
            // }
          });
        }
//      });
    }
*/
  };

  _.extend(App.prototype, Backbone.Events);

  return App;
});

