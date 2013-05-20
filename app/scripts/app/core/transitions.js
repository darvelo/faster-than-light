define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  function todos () {
    var views = this.views;
    var $todos = this.views.todos.$el;
    var els = _.chain(views)
               .filter(function (view) { return view !== this.views.app; }, this)
               .map(function (view) { return view.el; })
               .value();

    $(els).fadeOut(200);

    return $todos.fadeIn(300);
  }

  function init (_app) {
    return {
      todos: $.proxy(todos, _app)
    };
  }

  return init;
});
