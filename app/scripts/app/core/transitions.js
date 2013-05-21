define([
  'jquery',
  'underscore',
],

function ($, _) {
  'use strict';

  var actionViews;
  var actionViewEls;

  function transition (view) {
    var $view = view.$el;
    var viewEl = view.el;

    var els = _.reject(actionViewEls, function (el) { return el === viewEl; });

    $(els).fadeOut(200);

    return $view.fadeIn(300).promise();
  }

  function init (_app) {
    actionViews = _app.views.actionViews;
    actionViewEls = _.map(actionViews, function (view) { return view.el; });

    return transition;
  }

  return init;
});
