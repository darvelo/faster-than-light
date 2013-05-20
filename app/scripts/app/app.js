define([
  'socket.io',
  'core/config',
  'core/reset',
  'core/transitions',
  'routers/appRouter',
  'models/user',
  'collections/contexts',
  'collections/projects',
  'collections/tasks',
  'views/app',
  'views/todos',
  'backbone',
],

function(
  io,
  AppConfig,
  appDataReset,
  appTransitions,
  AppRouter,
  User,
  ContextsCollection,
  ProjectsCollection,
  TasksCollection,
  AppView,
  TodosView,
  Backbone
){
  'use strict';

  var App = function() {
    /*
     * Attach socket.io socket to app instance
     */
    this.socket = io.init(this);

    this.booting = true;


    this.createUser();
    this.instantiateCollections();
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
     * Set up function for app to reset collections with fresh data,
     * triggering a reset of Backbone Views with the 'reset' event
     */
    this.resetData = appDataReset;

    /*
     * Trigger data reset and thus, Views' data population
     */
    this.resetData(window.bootstrap || 'empty');



    Backbone.history.start({ pushState: true });


    this.booting = false;
    // this.connectApi();
  };

  App.prototype = {
    views: {},
    routers: {},
    collections: {},
    currentView: null,

    createUser: function createUser () {
      /*
       * Set up user model
       */
      this.user = new User(window.bootstrap.user || []);
      if (!window.bootstrap.user) {
        // need user info before moving on
        this.user.fetch({ async: false });
      } else {
        window.bootstrap.user = {};
      }
      this.user.app = this;
    },

    instantiateCollections: function instantiateCollections () {
      /*
       * Instantiate empty global collections that other,
       * local collections will reference once populated
       */
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

      this.views.todos = new TodosView(this);
      this.views.todos.render();
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

  return App;
});

