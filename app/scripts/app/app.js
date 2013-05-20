define([
  'socket.io',
  'core/config',
  'core/reset',
  'core/transitions',
  'core/api',
  'routers/appRouter',
  'models/user',
  'collections/contexts',
  'collections/projects',
  'collections/tasks',
  'views/app',
  'views/todos',
],

function(
  io,
  AppConfig,
  appDataReset,
  appTransitions,
  ApiManager,
  AppRouter,
  User,
  ContextsCollection,
  ProjectsCollection,
  TasksCollection,
  AppView,
  TodosView

){
  'use strict';

  var App = function() {
    this.socket = io.init(this);

    this.booting = true;

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


    /*
     * Instantiate empty global collections that other,
     * local collections will reference once populated
     */
    this.collections.contexts = new ContextsCollection([]);
    this.collections.projects = new ProjectsCollection([], { comparatorItem: 'id' });
    this.collections.tasks = new TasksCollection([], { comparatorItem: 'id' });

    /*
     * Create empty views
     */
    this.views.app = new AppView();
    this.views.app.render();

    this.views.todos = new TodosView(this);
    this.views.todos.render();

    /*
     * Set up view transition animation functions
     */
    this.transition = appTransitions(this);

    /*
     * Trigger data reset and thus, Views' data population
     */
    this.resetData = appDataReset;
    this.resetData(window.bootstrap || 'empty');

    /*
     * Create main router
     */
    this.routers.appRouter = new AppRouter({ app: this });
    this.navigate = this.routers.appRouter.navigate;




    this.booting = false;
    // this.connectApi();
  };

  App.prototype = {
    views: {},
    routers: {},
    collections: {},

    connectApi: function() {
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
  };

  return App;
});

