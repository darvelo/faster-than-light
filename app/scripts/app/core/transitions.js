define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  var views;
  var workViewEls;

  function todos () {
    var $todos = views.todos.$el;
    var els = _.filter(workViewEls, function (view) { return view !== views.todos.el; });

    $(els).fadeOut(200);

    return $todos.fadeIn(300).promise();
  }

  function init (_app) {
    views = _app.views;
    workViewEls = _.chain(views)
                   .filter(function (view) { return view !== views.app; })
                   .map(function (view) { return view.el; })
                   .value();

    return {
      todos: $.proxy(todos, _app)
    };
  }

  return init;
});
