'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};


exports.get = function (req, res, next) {
  app.db.bootstrap(req.user, function (err, bootstrap) {
    if (err) {
      return next(err);
    }

    // validate bootstrap object

    res.send(bootstrap);
  });
};
