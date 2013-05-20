define([
  'backbone',
],

function (Backbone) {
  'use strict';

  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'home',
      'todos': 'todos',
      'todos2/*splat': 'todostwo',
      'todos2/:id': 'todostwoid',
      'post/:id': 'showPost',
    },

    initialize: function initialize (options) {
      this.app = options.app;
    },

    home: function home () {
      // var homeView = new HomeView();
      // this.appView.showView(homeView);
      console.log('MADE IT HOME!');
      this.navigate('todos', { trigger: true, replace: true });
    },

    todos: function todos () {
      console.log('MADE IT TO TODOS!');
    },

    todostwo: function todostwo (splat) {
      console.log('MADE IT TO TODOS2!', splat);
    },

    todostwoid: function todostwoid (id) {
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
