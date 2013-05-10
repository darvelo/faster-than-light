'use strict';

var  async = require('async');

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.putUser = function(req, res, next) {
  // TODO: Validate JSON from req.body
  //

  app.db.users.updateUser(req.user.id, req.body, function(err, user) {
    if (err) {
      console.log('ERRORRRRRRRRRRRR!!!!!!!!!!!!!!!!!!', err);
      return next(err);
    }

    app.socketio.broadcastUser(req.user, user);
    res.send(JSON.stringify(user));
  });
};
