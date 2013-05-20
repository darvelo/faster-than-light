define([
  'backbone',
  'core/validators/index',
  'underscore',
],

function (Backbone, validators, _) {
  'use strict';

  var User = Backbone.Model.extend({
    url: '/api/users/me',
    defaults: {

    },

    validate: validators.user,

    saveLayoutSettings: function savePaneSettings () {
      if (this.app.booting) {
        return;
      }

      var self = this,
          outerLayout = this.app.outerLayout,
          innerLayout = this.app.innerLayout;

      // overwrite previous to get the latest settings
      this.tmpUser = {};
      this.tmpUser.menu = {},
      this.tmpUser.lastContexts = {},
      this.tmpUser.paneSizes = {},

      // set menu size and state
      this.tmpUser.menu.size = outerLayout.west.state.size;
      this.tmpUser.menu.isClosed = outerLayout.west.state.isClosed;

      // persist old paneSizes
      this.tmpUser.paneSizes = this.get('paneSizes');

      // write new paneSizes, and overwrite lastContexts and old paneSizes
      _.each(innerLayout.panes, function ($pane, position) {
        if ($pane) {
          this.tmpUser.lastContexts[position] = $pane.data('id');

          // center doesn't have a size
          if (position !== 'center') {
            this.tmpUser.paneSizes[position] = innerLayout[position].state.size;
          }
        }
      }, this);

      this.set(this.tmpUser);

      // if not waiting on other model resizes,
      // kick off waiting process, and when done, save user model.
      // this assures we get the settings after animations have settled down
      // or if multiple calls were issued, because a 'closing pane' event also triggers resize events
      if (!this.waitingForOthers) {
        this.waitingForOthers = true;

        setTimeout(function () {
          self.save();
          self.waitingForOthers = false;
        }, 600);
      }
    },
  });

  return User;
});
