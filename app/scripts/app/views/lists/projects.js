define([
  'backbone',
  'views/project',
  'underscore',
],

function (Backbone, ProjectView, _) {
  'use strict';

  var ProjectsView = Backbone.View.extend({
    className: 'projects',

    events: {},

    initialize: function initialize () {
      this.app = this.options.app;
      this.subViews = {};


    },

    _handleObjectEvents: function _handleObjectEvents (object, events, handler) {
      this.listenTo(object, events, handler);
    },

    _redelegateSubViewEvents: function _redelegateSubViewEvents (selector, subView) {
      var selectors;

      if (_.isObject(selector)) {
        selectors = selector;
      } else {
        selectors = {};
        selectors[selector] = subView;
      }

      if (!selectors) {
        return;
      }

      _.each(selectors, function (view, selector) {
        view.setElement(this.$(selector)).render();
      }, this);
    },

    _teardown: function teardown () {
      _.each(this.subViews, function (subView, id) {
        subView.teardown();
        delete this.subViews[id];
      });
      this.remove();
      this.undelegateEvents(); // not sure if this is necessary after remove()
    },

    render: function render () {
      this.collection.each(function (project) {
        var projectView = new ProjectView({ app: this.app, model: project });

        this.$el.append(projectView.render().el);
      }, this);

      this._redelegateSubViewEvents({
        '.subview'             : this.subview,
        '.another-subview'     : this.anotherSubview,
        '.yet-another-subview' : this.yetAnotherSubview,
      });

      return this;
    },

  });

  return ProjectsView;
});
