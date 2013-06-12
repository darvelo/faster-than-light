define([
  'backbone',
  'underscore',
],

function (Backbone, _) {
  'use strict';

  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'home',
      'todos': 'todos',
      'todos2/*splat': 'todostwo',
      'todos/view/:id': 'viewTodo',
      'post/:id': 'showPost',
    },

    initialize: function initialize (options) {
      this.app = options.app;
    },

    // from http://stackoverflow.com/questions/7563949/backbone-js-get-current-route
    current : function () {
      var Router = this;
      var fragment = Backbone.history.fragment;
      var routes = _.pairs(Router.routes);
      var route = null, params = null, matched;

      matched = _.find(routes, function(handler) {
        route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
        return route.test(fragment);
      });

      if(matched) {
        // NEW: Extracts the params using the internal
        // function _extractParameters
        params = Router._extractParameters(route, fragment);
        route = matched[1];
      }

      return {
        route : route,
        fragment : fragment,
        params : params
      };
    },

    home: function home () {
      this.app.currentView = 'home';
      // var homeView = new HomeView();
      // this.appView.showView(homeView);
      console.log('MADE IT HOME!');
      this.navigate('todos', { trigger: true, replace: true });
    },

    todos: function todos () {
      var app = this.app;

      console.log('MADE IT TO TODOS!');
      app.transition(app.views.actionViews.todos).then(function () {
        app.currentView = 'todos';
      });
    },

    viewTodo: function viewTodo (todoId) {
      console.log('MADE IT TO TODOS2 ID!', id);
    },

    showPost: function (id){
      // var post = posts.get(id);
      // var postView = new PostView({model: post});
      // this.appView.showView(postView);
    }
  });

  return AppRouter;
});
