'use strict';

var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var async = require('async');
var _ = require('underscore');
var inspect = require('util').inspect;

//var db = mongoose.createConnection('localhost', 'test');
//mongoose.connect('localhost', 'gettingstarted');
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function dbReady () {

// });
var db = mongoose.connect('mongodb://localhost/test');

// create our Models
var User = require('./models/user.js')(mongoose);
var Context = require('./models/context.js')(mongoose);
var Project = require('./models/project.js')(mongoose);
var Group = require('./models/group.js')(mongoose);
var Task = require('./models/task.js')(mongoose);
//var Task = require('./models/task.js')(mongoose, textSearch);


var seedDB = require('./seed');
seedDB.use(User, Context, Project, Group, Task);
seedDB.user('dave');
exports.seed = seedDB.seed;

exports.bootstrap = function (username, cb) {
  var args = _.toArray(arguments),
      bootstrap = {};

  if (args.length !== 2) {
    args[args.length-1](new Error('something is funky in the arguments'));
  } else if (! _.isString(username) || ! _.isFunction(cb)) {
    contextId(new Error('args not right type. numArgs = 2'));
  }

  // we're grabbing all projects associated with all tasks within all projects in a context.
  // In other words, if a task is sourced to projects not in this context,
  // we pre-emptively grab those projects to have info to show to the user
  // about where else that task is listed (context title, project title).

  async.waterfall([
    // get user data
    function (callback) {
      exports.getUserByName(username, function (err, user) {
        if (err) {
          callback(err);
        }

        bootstrap.user = user;
        callback(err, user.id, user.lastContext);
      });
    },
    // get contexts
    function (userId, lastContext, callback) {
      exports.getContexts(userId, function (err, contexts) {
        if (err) {
          callback(err);
          return;
        } else if (_.isEmpty(contexts)) {
          callback(new Error('empty context set'));
          return;
        }

        bootstrap.contexts = contexts;

        if (!lastContext) { // empty string or undefined
          callback(err, userId, contexts[0].id);
        } else {
          callback(err, userId, lastContext);
        }
      });
    },
    // get projects, auxprojects, and tasks
    function (userId, contextId, callback) {
      exports.fullMontyByContext(userId, contextId, callback);
    },
  ],

  function (err, projects, auxProjects, tasks) {
    if (err && err.message === 'empty context set') {
      bootstrap.contexts = [];
      bootstrap.projects = [];
      bootstrap.auxProjects = [];
      bootstrap.tasks = [];
      bootstrap.booting = true;

      cb(null, bootstrap);
      return;

    } else if (err) {
      cb(err);
      return;

    } else {
      bootstrap.projects = projects;
      bootstrap.auxProjects = auxProjects;
      bootstrap.tasks = tasks;
      bootstrap.booting = true;
    }

    cb(err, bootstrap);
  });
};

exports.fullMonty = function (userId, cb) {
  // return all user data, contexts, projects, and tasks
};

exports.fullMontyByContext = function (userId, contextId, cb) {
  // return all tasks within the projects in a context, and all projects which have sourced those tasks (auxilliaryProjects)
  // callback (
  //   [projects]
  //   [auxProjects]
  //   [tasks]
  // )
  if (arguments.length !== 3) {
    cb(new Error('not enough arguments for full monty by context'));
  }

  async.waterfall([
    // get the projects the context contains
    function (callback) {
      exports.getContext(userId, contextId, function (err, contexts) {
        if (err) {
          callback(err);
          return;
        } else if (_.isEmpty(contexts)) {
          callback(new Error('empty context set'));
          return;
        }

        callback(err, contexts[0].projects);
      });
    },

    // get tasks -- this is done before projects because sourced tasks may require projects out of this context
    function (projectsIds, callback) {
      var auxProjectsIds = [];
      var projectsIdsStrings = _.map(projectsIds, function (val) { return val.toString(); }); // for comparison

      exports.getTasksByProjects(userId, projectsIds, function (err, tasks) {
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

        console.log('projectsIds, auxProjectsIds', projectsIds, auxProjectsIds);
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

      exports.getProjectsByIds(userId, allProjectsIds, function (err, allProjects) {
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

exports.getUserByName = function (username, cb) {
  User.find({ username: username }, function (err, users) {
    if (err) {
      cb(err);
      return;
    } else if (users.length !== 1) {
      cb(new Error('improper user set'));
      return;
    }

    cb(null, users[0]);
  });
};

exports.getProjectsByIds = function (userId, projectsIds, cb) {
  if (arguments.length === 3 && _.isString(userId) && _.isArray(projectsIds)) {
    Project
      .find({ _id: { $in: projectsIds }})
      .sort('order')
      .exec(cb);
  } else {
    cb(new Error('somethin funky in the projectsByIds arguments'));
  }
};

exports.getTasks = function (userId, cb) {
  if (arguments.length === 2 && _.isString(userId)) {
    Task
      .find({ userId: userId })
      .exec(cb);
  } else {
    cb(new Error('somethin funky in the getTasks arguments'));
  }
};

exports.getTasksByProjects = function (userId, projectsIds, cb) {
  if (arguments.length === 3 && _.isString(userId) && _.isArray(projectsIds)) {
    Task
      .find({ userId: userId, 'appearances.projectId': { $in: projectsIds } })
      .exec(cb);
  } else {
    cb(new Error('somethin funky in the tasksByProjects arguments'));
  }
};

exports.getContext = function (userId, contextId, cb) {
  Context
    .find({ userId: userId, _id: contextId })
    .sort('order')
    .exec(cb);
};

exports.getContexts = function (userId, cb) {
  Context
    .find({ userId: userId })
    .sort('order')
    .exec(cb);
};

exports.postContext = function (contextObject, cb) {

};

/* test out text search */
/*
  // modules
  var mongoose = require('mongoose');
  var textSearch = require('mongoose-text-search');

  // create our schema
  var gameSchema = mongoose.Schema({
      name: String
    , tags: [String]
    , likes: Number
    , created: Date
  });

  // give our schema text search capabilities
  gameSchema.plugin(textSearch);

  // add a text index to the tags array
  gameSchema.index({ tags: 'text' });

  // test it out
  var Game = mongoose.model('Game', gameSchema);

  Game.create({ name: 'Super Mario 64', tags: ['nintendo', 'mario', '3d'] }, function (err) {
    if (err) return handleError(err);

    Game.textSearch('3d', function (err, output) {
      if (err) return handleError(err);

      var inspect = require('util').inspect;
      console.log(inspect(output, { depth: null }));

      // { queryDebugString: '3d||||||',
      //   language: 'english',
      //   results:
      //    [ { score: 1,
      //        obj:
      //         { name: 'Super Mario 64',
      //           _id: 5150993001900a0000000001,
      //           __v: 0,
      //           tags: [ 'nintendo', 'mario', '3d' ] } } ],
      //   stats:
      //    { nscanned: 1,
      //      nscannedObjects: 0,
      //      n: 1,
      //      nfound: 1,
      //      timeMicros: 77 },
      //   ok: 1 }
    });
  });
*/
