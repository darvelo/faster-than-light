define([
  'backbone',
  'underscore',
],

function (Backbone, _) {
  'use strict';

  var BaseView = Backbone.View.extend({
    _teardown: function _teardown () {
      _.each(this.subViews, function (subView, id) {
        subView._teardown();
        delete this.subViews[id];
      }, this);
      this.remove();
      this.undelegateEvents(); // not sure if this is necessary after remove()
    },

    _teardownSubviews: function _teardownSubviews () {
      _.each(this.subViews, function (subView, id) {
        subView._teardownSubviews();
        subView.remove()
        delete this.subViews[id];
      }, this);
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

    _redelegateViewEvents: function _redelegateViewEvents () {
      this.setElement(this.$el);
    },
  });

  return BaseView;
});
