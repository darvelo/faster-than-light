'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.getAssociatedData = function (req, res, next) {
  app.db.batch.fullMontyByContexts(req.user.id, [req.params.id], function (err, results) {
    if (err) {
      return next(err);
    }

    // validate here
    //

    // results = { projects, auxProjects, tasks }
    res.send(JSON.stringify(results));
  });
};
