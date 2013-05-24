define([
  'core/util',
  'views/lists/contextTodo',
  'backbone',
  'jquery',
  'underscore',
],

function (util, ContextTodoView, Backbone, $, _) {
  'use strict';

  var BaseView = Backbone.View.extend({
    /**********
     * The [jQuery Documentation about promises](http://api.jquery.com/promise/) says that:
     *
     * Note: The returned Promise is linked to a Deferred object stored on the
     * .data() for an element. Since the.remove() method removes the element's
     * data as well as the element itself, it will prevent any of the element's
     * unresolved Promises from resolving. If it is necessary to remove an element
     * from the DOM before its Promise is resolved, use .detach() instead and
     * follow with .removeData() after resolution.
     *
     ***********
     * The use case for this is when a method remove()s the $el as an animation
     * is expected to return a promise to another method.
     *
     * I'll be using promises to work with animations so I'm augmenting the View's
     * remove() method to call .stop(true, true), clearing the queue and moving all
     * animations to the final frame. This will resolve their promises.
     *
     * Unfortunately the animations are brought to the final frame after the promise
     * callbacks are called if you're using the .promise() method to return a promise
     * from the animation.
     *
     *
     * /////////////////
     * // THEREFORE!! //
     * /////////////////
     *
     * If you want to have a promise returned on an animation for an element that was removed
     * from the DOM, you NEED to put the callback in the OPTIONS of the animation function call,
     * like:
     *
     * $el.slideUp({ duration: 100, done: doneCallback, fail: failCallback });
     *
     * NOT: $el.slideUp({ duration: 100 }).promise().done(doneCallback);
     *
     * The latter will NOT reflect the final state of the animation on .stop(true, true);
     *
     * In the former example, the promise callbacks receive the promise itself as the first argument,
     * and Boolean true if the animation was stopped and jumpedToEnd.
     *
     *
     *
     * I'm not calling .detach() and .removeData() as mentioned because I don't plan to keep the $el
     * around on .remove(). Use ._detach() on the View for that.
     */

    // should almost never need to call this directly.
    // call _teardown() instead to remove a view and its event listeners.
    remove: function remove () {
      // resolves all promises on animations
      this.$el.stop(true, true);
      // this.$el.detach();
      // this.$el.removeData();

      return Backbone.View.remove.apply(this, arguments);
    },

    _teardown: function _teardown () {
      _.each(this.subViews, function (subView, id) {
        subView._teardown();
        // remove object reference to the view for garbage collection
        this.subViews[id] = null;
      }, this);

      // remove all other references to other objects.
      // can be fairly liberal with this and include catch-all
      // properties from all kinds of views since it's a null assignment.
      this.parent = null;
      this.project = null;

      // trigger removal of references to this view from other objects
      if (this instanceof ContextTodoView) {
        this.model.trigger('context:teardownView', this.model);
      }

      // automatically calls .undelegateEvents() indirectly since
      // jQuery removes DOM events on $el when it's removed from the DOM.
      // also calls .stopListening() with no arguments to unbind all events.
      this.remove();

      return this;
    },

    _teardownSubviews: function _teardownSubviews () {
      _.each(this.subViews, function (subView, id) {
        subView._teardown();
        // remove object reference to the view for garbage collection
        this.subViews[id] = null;
      }, this);

      return this;
    },

    // redelegats jQuery DOM events only for subView(s), specified by selector(s).
    // with this, you can even specify a new element to delegate subView events to,
    // by using a different selector than the subView's $el (uses view.setElement)
    // altenatively, if selector is a DOM element, or jQuery object with the first
    // in the index, being the subView's el, it'll simply call subView.delegateEvents.
    _redelegateSubViewEvents: function _redelegateSubViewEvents (selector, subView) {
      var selectors;

      // if we're just redelegating events on the same element, use this shortcut
      if (subView) {
        if ((selector instanceof $ && (selector[0] === subView.el)) ||
            (util.isADomElementOrNode(selector) && (selector === subView.el))) {

          subView.delegateEvents();
          return;
        }
      }

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

    // _detach is an alternative to .remove(); it keeps all Backbone
    // Event listeners -- doesn't call .stopListening() like .remove() does.
    // jQuery events are still removed, so .delegateEvents() needs to be called
    // when the $el is reinserted into the DOM.
    _detach: function _detach () {
      // this probably isn't necessary because .detach() keeps $el.data(), which will fire promises.
      // since the view shouldn't mess with other views, this shouldn't be a problem.
      // the only case I can think of is if a view triggers a transition after animation.. but I dunno.
      // this.$el.stop(true, true);

      // calling this instead of $el.remove() will keep any $el.data() that's on the $el, including promise callbacks.
      // useful if you're planning to reinsert $el into the DOM at a later time.
      this.$el.detach();

      // to be called if you want to remove any $el.data() on the $el
      // this.$el.removeData();

      return this;
    },

    // When $el is _detach()'d from the DOM, all DOM events are removed.
    // This reattaches DOM events to the $el.
    //
    // If you View.remove()'d the $el instead, you must manually re-register the Backbone event listeners.
    // This means the view MUST have an .addListeners() method where the majority if not the totality
    // of its Backbone Events are registered, to make doing this easy. This doesn't necessarily mean
    // that the callbacks will be registered in the original order, so event callback flow may get to
    // the re-registered callback(s) after other callbacks on other objects have already been called.
    //
    _reattachEvents: function _reattachEvents () {
      // call these two first so the event listeners
      // are added before any child views' listeners
      this.delegateEvents();
      // shouldn't need this because .detach() doesn't call the native Backbone.View.remove()
      // this.addListeners();

      _.each(this.subViews, function (subView, id) {
        subView._reattachEvents();
      }, this);

      // jquery ui events may not work again on reattach.. have to see. might need to .sortable() again

      return this;
    },

    // read the note above _reattach() to know why this may be a bad idea.
    _reRegisterBackboneAndjQueryEvents: function _reRegisterBackboneAndjQueryEvents () {
      // call these two first so the event listeners
      // are added before any child views' listeners
      this.delegateEvents();
      // this method may not even exist on the view calling it.
      this.addListeners();

      _.each(this.subViews, function (subView, id) {
        subView._reRegisterBackboneAndjQueryEvents();
      }, this);

      // jquery ui events may not work again on reattach.. have to see. might need to .sortable() again

      return this;
    },
  });

  return BaseView;
});
