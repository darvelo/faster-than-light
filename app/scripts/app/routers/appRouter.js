define([
  'backbone',
],

function (Backbone) {
  'use strict';

  var appRouter = Backbone.Router.extend({
    routes: {
      '': 'home',
      'post/:id': 'showPost',
    },

    initialize: function(options){
      this.appView = options.appView;
    },

    home: function(){
      var homeView = new HomeView();
      this.appView.showView(homeView);
    },

    showPost: function(id){
      var post = posts.get(id);
      var postView = new PostView({model: post});
      this.appView.showView(postView);
    }
  });

  return appRouter;
});
