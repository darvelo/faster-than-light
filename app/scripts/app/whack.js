/*global Backbone */
'use strict';

/*var User = Backbone.Model.extend({
  initialize: function() {
    this.on('change:name', function (model) {
      console.log('- Name item has changed.');
    });
    this.on('change:email', function (model) {
      console.log('- Email item has changed.');
    });
  },

  validate: function(atts){
//    console.log('yoyoyoyoyoyoyo');
    if (!atts.email || atts.email.length < 3) {
      return new Error("email mus be at least 3 chars");
    }
  },

  defaults: {
    name: 'anon',
    email: ''
  }
});

var UserView = Backbone.View.extend({
  tagName: 'li',

  userTpl: _.template( $('#mytmpl').html() ),

  events: {
    'dblclick': 'enter'
  },

  render: function() {
    this.$el.html( this.userTpl( this.model.toJSON() ) );
    $('ul').html(this.el);
    return this;
  },

  enter: function () {
    this.model.set({
      name: Math.random() * 400000,
      email: Math.random() * 6040039
    });
    this.render();
  }
});

var UserCollection = Backbone.Collection.extend({
  model: User
//  localStorage: new Store('todos-backbone')
});

//Backbone.sync = function (method, model, options) {
//  console.log("I've been passed " + method + " with " + JSON.stringify(model));
//};

var user = new User({ id: 1, name: 'Billy Bob', email: "billybob@bob.net" });
var myView = new UserView();
var userColl = new UserCollection([user]);

userColl.on('change:name', function (model) {
  console.log("Changed name to " + model.get('name'));
});

userColl.on('add', function (model) {
  console.log('Added ' + model.get('name'));
});

userColl.on('remove', function (model) {
  console.log('Removed ' + model.get('name'));
});

userColl.on('reset', function () {
  console.log('Collection reset.');
});

userColl.add([
  { id: 2, name: "JoJo", email: "oJoJ@oj.com" },
  { id: 3, name: "Doobie Joe", email: "DOOBJOE@DJ.net" }
]);

// Backbone Collections appear to inherit from Underscore
userColl.forEach(function (model) {
  console.log(model.get('name'));
});

var sorted = userColl.sortBy(function (model) {
  return model.get('name').toLowerCase();
});

console.log("- Now Sorted");
sorted.forEach(function (model) {
  console.log(model.get('name'));
});

userColl.get(2).set({name: 'Guardos'});
userColl.remove(3);
*/

var Task = Backbone.Model.extend({
  initialize: function() {
    this.on('change:title', function (model) {
      console.log('- Name item has changed.' + ' - TaskCollection');
    });
    this.on('change:projects', function (model) {
      console.log('- Email item has changed.' + ' - Taskcollection');
    });

  },
  defaults: {
    // name: 'anon',
    // email: ''
  }
});

var TaskCollection = Backbone.Collection.extend({
  model: Task
});

var TaskView = Backbone.View.extend({
  className: 'task',

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'add', this.render);
    this.listenTo(this.model, 'destroy', this.remove); // destroys all views that are listening to this model
  },

  events: {
    'dblclick': 'titleChange',
  },

  render: function() {
    console.log(this.model.get('title'))
    this.$el.html(this.model.get('title'));
    return this;
  },

  titleChange: function() {
    this.trigger('blahblah', this.model, this.$el); // alert specific projectview when specific taskview has changed
    var newTitle = prompt('yoyo watup');
    if (newTitle == 'swap') { this.model.destroy(); }
    this.model.set('title', newTitle);
  },
});

var Project = Backbone.Model.extend({
  initialize: function() {
    this.listenTo(this.get('tasks'), 'change:title', function (model) {
      console.log('- Name item has changed. - ' + this.get('title'));
      this.trigger('change:task', model);
    });
    this.on('change:projects', function (model) {
      console.log('- Email item has changed. - ' + this.get('title'));
    });
  },
  defaults: {
  }
});

var ProjectCollection = Backbone.Collection.extend({
  model: Project
});

var ProjectView = Backbone.View.extend({
  className: 'project',

  initialize: function() {
    this.tasks = this.model.get('tasks');
    this.listenTo(this.model, 'change', this.render);
     this.listenTo(this.tasks, 'change', this.taskChange);
     this.listenTo(this.tasks, 'add', this.taskAdd);
  },

  events: {
    'dblclick h1': 'titleChange',
  },

  render: function() {
    var h1 = $('<h1>').html(this.model.get('title'));
    this.$el.html(h1);

    this.tasks.each(function(task) {
      var view = new TaskView({ model: task });
     // this.views[task.get('id')] = view;
      this.listenTo(view, 'blahblah', function(model, id) { console.log(this.model.get('title'), model, id.parent())});
      this.$el.append(view.render().el);
    }, this);

    return this;
  },

  titleChange: function(project) {
    var newTitle = prompt('yoyo watup');
    this.model.set('title', newTitle);
  },
  taskChange: function(task) {
    console.log('yo a task changed -- im in ' + this.model.get('title') + '!');
    this.render();
  },
  taskAdd: function(task) {
    console.log('yo a task added -- im in ' + this.model.get('title') + '!');
    this.render();
  },

  viewChange: function(model, id) {
    console.log(model, id);
  },
});

var ProjectsView = Backbone.View.extend({
  className: 'projects',

  initialize: function() {
    this.views = window.views = {};
  },

  events: {},

  render: function() {

    this.collection.each(function(project) {
      var view = new ProjectView({ model: project });
      this.views[project.get('id')] = view;
      this.$el.append(view.render().el)
    }, this);

    this.options.appView.$el.append(this.$el);

    return this;
  },
});


var AppView = Backbone.View.extend({
  className: 'app',

  initialize: function() {
    this.render();
  },

  events: {},

  render: function() {
    console.log('eltime', this.el, this.$el);


    $('body').append(this.$el);

    return this;
  },

  titleChange: function() {

  },
});

$(document).ready(function () {
  Backbone.sync = function (one, two, three) { console.log('this happened', one, two, three); };
  var Projects = new ProjectCollection([
    { id: 1, title: 'Write', tasks: new TaskCollection() },
    { id: 2, title: 'Read Some', tasks: new TaskCollection() }
  ]);

  window.Tasks = new TaskCollection();
  window.Tasks.on('add', function (task) {
    var projectsArray = task.get('projects');
    for (var id = 0; id < projectsArray.length; id++) {
      var project = Projects.get(projectsArray[id]);
      var title = project.get('title');

      project.get('tasks').add(task);
      console.log(title);
    }
  });


  var task1 = new Task({ id: 0, title: 'do something', projects: [1, 2]});
  window.Tasks.add(task1);

  window.App = {};
  window.App.AppView = new AppView();
  window.App.ProjectsView = new ProjectsView({
    collection: Projects,
    appView: window.App.AppView
  });
  window.App.ProjectsView.render();

});



