define([
  'backbone',
  'collections/projects',
  'JST/lists/context',
  'underscore',
],

function (Backbone, ProjectsCollection, template, _) {
  'use strict';

  var Context = Backbone.View.extend({
    tagName: 'li',
    className: 'context',

    template: template,

    events: {
      'click': 'toggleActive',
    },

    initialize: function initialize () {
      this.app = this.options.app;
      this.active = false;

      this.listenTo(this.model, 'change:active', this.setActive);
      this.listenTo(this.model, 'change:inactive', this.setInactive);
      this.listenTo(this.model, 'change:title', function (model) {
        console.log('model title changed -- listview', this.$el);
        this.$el.find('.title').text(model.get('title'));
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
        this.model.trigger('remove:pane');
      } else {
        this.model.trigger('add:pane');
      }
    },
  });

  return Context;
});
