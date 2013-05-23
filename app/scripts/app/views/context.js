define([
  'views/base',
  'collections/projects',
  'JST/lists/context',
  'underscore',
],

function (BaseView, ProjectsCollection, template, _) {
  'use strict';

  var Context = BaseView.extend({
    tagName: 'li',
    className: 'context',

    template: template,

    events: {
      'click': 'toggleActive',
    },

    initialize: function initialize () {
      this.app = this.options.app;
      this.active = false;

      // these need to be registered before the TodoView fires these events
      this.listenTo(this.model, 'context:active', this.setActive);
      this.listenTo(this.model, 'context:inactive', this.setInactive);

      this.listenTo(this.model, 'change:title', function (model) {
        console.log('model title changed -- listview', this.$el);
        this.$('.title').text(model.get('title'));
      });


    },

    render: function render () {
      this.$el.append(template(this.model.toJSON()));

      return this;
    },

    setActive: function setActive () {
      this.$el.addClass('active');
      this.active = true;
    },

    setInactive: function setInactive () {
      this.$el.removeClass('active');
      this.active = false;
    },

    toggleActive: function toggleContext (e) {
      if (this.active) {
        this.model.trigger('context:deactivate', this.model);
      } else {
        this.model.trigger('context:activate', this.model);
      }
    },
  });

  return Context;
});
