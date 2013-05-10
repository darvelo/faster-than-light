'use strict';

var async = require('async');
var _ = require('underscore');

var e, app;
exports.use = function (appInstance) {
  app = appInstance;
  e = app.errors;
};

var User, Context, Project, Task;
exports.schemas = function (UserSchema, ContextSchema, ProjectSchema, TaskSchema) {
  User = UserSchema;
  Context = ContextSchema;
  Project = ProjectSchema;
  Task = TaskSchema;
};


/*
 * Utilities
 */
function getContextIdsFromLastContexts (lastContexts) {
  // .toObject() was needed for this to work in the argument value
  // without it lastContexts was being treated as a document with private props
  if (!lastContexts || _.isEmpty(lastContexts)) {
    return [];
  }

  return _.values(lastContexts);
}
function getProjectIdsFromContexts (contexts) {
  var projectIds = [];

  if (!contexts || _.isEmpty(contexts)) {
    return [];
  }

  _.each(contexts, function (context) {
    projectIds = projectIds.concat(context.projects);
  });

  return projectIds;
}

/*
 * Exports
 */
exports.bootstrap = function (user, cb) {
  var args = _.toArray(arguments),
      bootstrap = {};

  if (args.length !== 2) {
    args[args.length-1](new Error('something is funky in the arguments'));
  }

  // we're grabbing all projects associated with all tasks within all projects in a context.
  // In other words, if a task is sourced to projects not in this context,
  // we pre-emptively grab those projects to have info to show to the user
  // about where else that task is listed (context title, project title).

  async.auto({
    // get user data
    getUser: function (callback) {
      callback(null, user);
    },
    // get contexts
    getContexts: ['getUser', function (callback, results) {
      app.db.contexts.getContexts(results.getUser.id, callback);
    }],
    // get projects, auxProjects, and tasks
    getFullMonty: ['getUser', 'getContexts', function (callback, results) {
      // .toObject() was needed for this to work in the argument value
      // without it lastContexts was being treated as a document with private props
      var lastContexts = getContextIdsFromLastContexts(results.getUser.lastContexts.toObject());

      exports.fullMontyByContexts(results.getUser.id, lastContexts, callback);
    }],
  },
  function (err, results) {
  // results.getFullMonty gives --> [projects, auxProjects, tasks]
    bootstrap.user = results.getUser;
    bootstrap.contexts = results.getContexts;
    bootstrap.projects = results.getFullMonty[0];
    bootstrap.auxProjects = results.getFullMonty[1];
    bootstrap.tasks = results.getFullMonty[2];
    bootstrap.booting = true;

    cb(err, bootstrap);
  });
};

exports.fullMontyByContexts = function (userId, contextIds, cb) {
  // return all tasks within the projects in a context, and all projects which have sourced those tasks (auxilliaryProjects)
  // callback (
  //   [projects]
  //   [auxProjects]
  //   [tasks]
  // )
  if (arguments.length !== 3) {
    return cb(new Error('not enough arguments for full monty by contexts'));
  }

  if (contextIds.length === 0) {
    // err, projects, auxProjects, tasks
    return cb(null, [], [], []);
  }

  async.waterfall([
    // get the projects the context contains
    function (callback) {
      app.db.contexts.getContextsByIds(userId, contextIds, function (err, contexts) {
        if (err) {
          callback(err);
          return;
        }

        callback(err, getProjectIdsFromContexts(contexts));
      });
    },

    // get tasks -- this is done before projects because sourced tasks may require projects out of this context
    function (projectsIds, callback) {
      var auxProjectsIds = [];
      var projectsIdsStrings = _.map(projectsIds, function (val) { return val.toString(); }); // for comparison

      app.db.tasks.getTasksByProjects(userId, projectsIds, function (err, tasks) {
        if (err) {
          callback(err);
          return;
        }

        _.forEach(tasks, function (task) {
          _.forEach(task.appearances, function (appearance) {
            auxProjectsIds = auxProjectsIds.concat(appearance.projectId);
          });
        });

        auxProjectsIds = _.chain(auxProjectsIds)
                           .uniq(false, function (val) { return val.toString(); }) // _ids are ObjectIds, not strings. use comparator function
                           .reject(function (val) { return _.contains(projectsIdsStrings, val.toString()); }) // return projects that aren't in main projects
                           .value();

        // console.log('projectsIds, auxProjectsIds', projectsIds, auxProjectsIds);
        callback(err, projectsIds, auxProjectsIds, tasks);
      });
    },
    // get projects
    function (projectsIds, auxProjectsIds, tasks, callback) {
      var projects = [],
          auxProjects = [],
          allProjectsIds = projectsIds.concat(auxProjectsIds),
          projectsIdsStrings = _.map(projectsIds, function (val) { return val.toString(); }), // for comparison
          auxProjectsIdsStrings = _.map(auxProjectsIds, function (val) { return val.toString(); }); // for comparison

      app.db.projects.getProjectsByIds(userId, allProjectsIds, function (err, allProjects) {
        if (err) {
          callback(err);
          return;
        }

        _.forEach(allProjects, function (project) {
          var projectId = project.id.toString();

          if (_.contains(projectsIdsStrings, projectId)) {
            projects.push(project);
          } else if (_.contains(auxProjectsIdsStrings, projectId)) {
            auxProjects.push(project);
          }
        });

        callback(err, projects, auxProjects, tasks);
      });
    },
  ],

  function (err, projects, auxProjects, tasks) {
   // console.log('results son', projects, auxProjects, tasks);
    cb(err, projects, auxProjects, tasks);
  });

};
