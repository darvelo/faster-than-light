define([
  'views/base',
  'views/project',
  'underscore',
],

function (BaseView, ProjectView, _) {
  'use strict';

  var ProjectsView = BaseView.extend({
    className: 'projects',

    events: {},

    initialize: function initialize () {
      this.app = this.options.app;
      this.subViews = {};


    },

    render: function render () {
      this.collection.each(function (project) {
        var projectView = new ProjectView({ app: this.app, model: project });

        this.$el.append(projectView.render().el);
      }, this);

/*      this._redelegateSubViewEvents({
        '.subview'             : this.subview,
        '.another-subview'     : this.anotherSubview,
        '.yet-another-subview' : this.yetAnotherSubview,
      });
*/
      return this;
    },

  });

  return ProjectsView;
});
