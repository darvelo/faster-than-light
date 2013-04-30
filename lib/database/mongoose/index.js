'use strict';

var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var async = require('async');
var _ = require('underscore');

var connectOptions = {
  // db: { native_parser: true },
  server: {
    auto_reconnect: true,
    // poolSize: 1,
  },
  // replset: { rs_name: 'myReplicaSetName' },
  // user: 'myUserName',
  // pass: 'myPassword',
};

// connectOptions.server.socketOptions = connectOptions.replset.socketOptions = { keepAlive: 1 };
connectOptions.server.socketOptions = { keepAlive: 1 };
exports.mainDB = mongoose.connect('mongodb://localhost/test', connectOptions);

// create our Models
var User = require('./models/user.js')(mongoose);
var Context = require('./models/context.js')(mongoose);
var Project = require('./models/project.js')(mongoose);
var Group = require('./models/group.js')(mongoose);
var Task = require('./models/task.js')(mongoose);
//var Task = require('./models/task.js')(mongoose, textSearch);


var seedDB = require('./seed');
seedDB.schemas(User, Context, Project, Group, Task);
exports.seed = seedDB.seed;


var app; // placeholder for app instance defined in exports.use()
exports.use = function (appInstance) {
  app = appInstance;

  seedDB.use(app);
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
      //exports.getUserById(username, callback);
      callback(null, user);
    },
    // get contexts
    getContexts: ['getUser', function (callback, results) {
      exports.getContexts(results.getUser.id, callback);
    }],
    // get projects, auxProjects, and tasks
    getFullMonty: ['getUser', 'getContexts', function (callback, results) {
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

exports.fullMontyByContext = function (userId, contextId, cb) {
  if (arguments.length !== 3) {
    cb(new Error('not enough arguments for full monty by context'));
  }

  exports.fullMontyByContexts(userId, [contextId], cb);
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
      exports.getContextsByIds(userId, contextIds, function (err, contexts) {
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

exports.getUserById = function (userId, cb) {
  User.findById(userId)
    .exec(cb);
};

exports.getUserByName = function (username, cb) {
  User.find({ username: username }, function (err, users) {
    if (err) {
      return cb(err);
    } else if (users.length !== 1) {
      return cb(new Error('improper number of users returned'));
    }

    cb(null, users[0]);
  });
};

exports.getProjectsByIds = function (userId, projectsIds, cb) {
  if (arguments.length === 3 && _.isString(userId) && _.isArray(projectsIds)) {
    Project
      .where('_id').in(projectsIds)
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
      .find({ userId: userId })
      .where('appearances.projectId').in(projectsIds)
      .exec(cb);
  } else {
    cb(new Error('somethin funky in the tasksByProjects arguments'));
  }
};

exports.getContextById = function (userId, contextId, cb) {
  Context
    .find({ userId: userId, _id: contextId })
    .sort('order')
    .exec(function (err, contexts) {
      if (_.isEmpty(contexts)) {
        cb(new Error('empty context set'));
        return;
      }

      cb(err, contexts);
    });
};

exports.getContextsByIds = function (userId, contextIds, cb) {
  Context
    .find({ userId: userId })
    .where('_id').in(contextIds)
    .sort('order')
    .exec(function (err, contexts) {
      console.log('contextids', contextIds)
      if (_.isEmpty(contexts) && ! _.isEmpty(contextIds)) {
        cb(new Error('empty contexts set'));
        return;
      }

      cb(err, contexts);
    });
};

exports.getContexts = function (userId, cb) {
  if (_.isFunction(userId)) {
    cb = userId;
    return cb(new Error('no userId supplied'));
  }

  if (! _.isFunction(cb)) {
    throw new Error('callback not a function son!');
  }

  if (arguments.length !== 2 || ! _.isString(userId)) {
    return cb(new Error('arguments are jacked!'));
  }

  Context
    .find({ userId: userId })
    .sort('order')
    .exec(cb);
};

exports.postContext = function (contextObject, cb) {

};

exports.updateUser = function (userId, userModel, cb) {
  // is sent as $set { key: value }, which is different from how mongo works
  // mongo would remove any key/value pairs that aren't in userModel
  //
  if (_.isEmpty(userModel.lastContexts)) {
    userModel.lastContexts = []; // for some reason it won't save an empty object literal.. it keeps the old value
  }

  User.findByIdAndUpdate(userId, { $set: userModel }, cb);
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
