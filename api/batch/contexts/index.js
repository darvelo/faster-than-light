'use strict';

var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;
};

exports.getAssociatedData = function (req, res, next) {
  app.db.batch.fullMontyByContexts(req.user.id, [req.params.id], function (err, projects, auxProjects, tasks) {
    if (err) {
      return next(err);
    }

    // validate here
    //

    res.send(JSON.stringify({
      projects: projects,
      auxProjects: auxProjects,
      tasks: tasks,
    }));
  });
};
