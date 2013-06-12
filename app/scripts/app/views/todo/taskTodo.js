define([
  'core/errorlog',
  'views/base',
  'underscore',
],

function (errlog, BaseView, _) {
  'use strict';

  var TaskTodoView = BaseView.extend({
    className: 'task',

    template: null,

    events: {},

    initialize: function initialize (options) {
      this.app = options.app;
      this.canonicalModel = options.canonicalModel;
      this.appearances = options.appearances;

      var allAppearances = this.app.lists.collections.appearances[this.canonicalModel.get('id')];
      var thisAppearance = allAppearances.findWhere(this.appearances);

      if (thisAppearance.length > 1) {
        errlog(1, 'found an model with more than one identical appearance. taskId: ' + this.canonicalModel.get('id'));
      }

      // create a new appearance for the model
      if (_.isEmpty(thisAppearance)) {

      // use appearance that's already there?
      //
      // i think this might mean that we're changing the appearance to match the one given
      } else {

      }


    },

    render: function render () {

    },
  });
});
