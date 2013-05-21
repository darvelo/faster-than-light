define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  var views;
  var actionViewEls;

  function transition (view) {
    var $view = view.$el;
    var viewEl = view.el;

    var els = _.reject(actionViewEls, function (el) { return el === viewEl; });

    $(els).fadeOut(200);

    return $view.fadeIn(300).promise();
  }

  function init (_app) {
    views = _app.views;
    actionViewEls = _.chain(views)
                   .reject(function (view) { return view === views.app; })
                   .map(function (view) { return view.el; })
                   .value();

    return transition;
  }

  return init;
});
