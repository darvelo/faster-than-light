define([
  'core/config',
  'core/api',
  'views/app',
  'views/auth',
  'views/lists/menu',
  'collections/tasklists',
],

function(AppConfig, ApiManager, AppView, AuthView, ListMenuView, TaskLists) {
  'use strict';

  var App = function() {
    this.views.app = new AppView();
    this.views.app.render();

    this.views.auth = new AuthView(this);
    this.views.auth.render();

    this.collections.lists = new TaskLists();
    this.views.listMenu = new ListMenuView({ collection: this.collections.lists });


    this.connectApi();
  };

  App.prototype = {
    views: {},
    collections: {},

    connectApi: function() {
      var self = this;

      this.apiManager = new ApiManager(this);
//      this.apiManager.on('ready', function(results) {
        if (window.bootstrap) {
          console.log('aaaaa!!')
          self.collections.lists.reset(window.bootstrap);
        } else {
          console.log('yoyoyo')
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

