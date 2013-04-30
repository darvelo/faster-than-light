define([
  'core/config',
  'core/api',
  // 'views/auth',
  // 'views/lists/menu',
  // 'collections/tasklists',
  // 'views/lists/task',
  'models/user',
  'collections/contexts',
  'collections/projects',
  'collections/tasks',
  'views/app',
  'views/todos',
],

function(AppConfig, ApiManager, User, ContextsCollection, ProjectsCollection, TasksCollection, AppView, TodosView) {
  'use strict';

  var App = function() {
    if (window.bootstrap && window.bootstrap.booting) {
      this.booting = true;
    }

    if (window.bootstrap && window.bootstrap.user) {
      this.user = new User(window.bootstrap.user);
      this.user.app = this;
    }

    if (window.bootstrap && window.bootstrap.contexts) {
      this.collections.contexts = new ContextsCollection(window.bootstrap.contexts);
    }

    if (window.bootstrap && window.bootstrap.projects) {
      this.collections.projects = new ProjectsCollection(window.bootstrap.projects, {
                                        comparatorItem: 'id',
                                      });
    }

    if (window.bootstrap && window.bootstrap.auxProjects) {
      if (this.collections.projects) {
        this.collections.projects.add(window.bootstrap.auxProjects);
      } else {
        this.collections.projects = new ProjectsCollection(window.bootstrap.projects, {
                                          comparatorItem: 'id',
                                        });
      }
    }

    if (window.bootstrap && window.bootstrap.tasks) {
      this.collections.tasks = new TasksCollection(window.bootstrap.tasks, {
                                      comparatorItem: 'id',
                                    });
    }

    this.views.app = new AppView();
    this.views.app.render();

    // this.views.auth = new AuthView(this);
    // this.views.auth.render();

    this.views.todos = new TodosView(this);
    this.views.todos.render();

    this.booting = false;
    // window.bootstrap = null;

    // this.collections.lists = new TaskLists(); /// sort original tasklist by id, others are sorted by 'order'
    // this.views.listMenu = new ListMenuView({ collection: this.collections.lists });


    // this.connectApi();
  };

  App.prototype = {
    views: {},
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

