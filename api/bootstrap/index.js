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

// triggered when a route needs the data,
// rather than Express triggering the API through app.get()
exports.routeGet = function (user, cb) {
  app.db.bootstrap(user, function (err, bootstrap) {
    if (err) {
      return cb(err);
    }

    // validate bootstrap object

    cb(null, bootstrap);
  });

};
