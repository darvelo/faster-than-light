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

exports.bootstrap = function (username, /* optional */ contextId, cb) { // TODO: Change username to userId using sessions and authentication
  var args = Array.prototype.slice.call(arguments),
      bootstrap = {};

  if (args.length < 2 || args.length > 3) {
    args[args.length-1](new Error('something is funky in the arguments'));
  } else if (args.length === 2 && (! _.isString(username) || ! _.isFunction(contextId))) {
    contextId(new Error('args not right type. numArgs = 2'));
  } else if (args.length === 3 && (! _.isString(username) || !_.isString(contextId) || ! _.isFunction(cb))) {
    cb(new Error('args not right type. numArgs = 3'));
  }

  if (args.length === 2) {
    cb = contextId;
    contextId = undefined;
  }

  // if the arguments length is two, we're bootstrapping.
  // context = User.lastContext
  //
  // if arguments length is three, we're grabbing all projects
  // associated with all tasks within all projects in a context.
  // In other words, if a task is sourced to projects not in this context,
  // we pre-emptively grab those projects to have info to show to the user
  // about where else that task is listed (context title, project title).

  async.waterfall([
    function (callback) {
      exports.getUserId(username, function (err, result) {
        if (err) {
          callback(err);
        } else if (result.length !== 1) {
          callback(new Error('improper user set'));
        }

        bootstrap.user = result[0];

        callback(err, result[0].id);
      });
    },
    // get contexts
    function (userId, callback) {

      function returnContexts (err, userId, contexts) {
        bootstrap.contexts = contexts;
        callback(err, userId, contexts);
      }

      if (!contextId) {
        exports.getContexts(userId, function (err, contexts) {
          returnContexts(err, userId, contexts);
        });
      } else {
        exports.getContext(userId, contextId, function (err, contexts) {
          returnContexts(err, userId, contexts);
        });
      }
    },
    // get tasks -- this is done before projects because sourced tasks may require projects out of this context
    function (userId, contextArray, callback) {
      var projects = [];

      contextArray.forEach(function (context) {
        console.log('context', context.projects);
        projects = projects.concat(context.projects);
      });

      exports.getTasks(userId, projects, function (err, tasksArray) {
        bootstrap.tasks = tasksArray;

        console.log('projects', projects);
        console.log('tasksArray', tasksArray);
        //tasksArray.map();
       //callback(err, userId, contextArray, tasksArray, projects);
       callback(err, bootstrap);
      });
    },
    // get projects
  ],

  function (err, bootstrap) {
//    console.log('bootstrap results: ', bootstrap);
    cb(err, bootstrap);
  });
};

exports.getUserId = function (username, cb) {
  User.find({ username: username }, cb);
};

exports.getTasks = function (userId, /* optional */ projectsArray, cb) {
  if (arguments.length === 2 && _.isString(userId) && _.isFunction(projectsArray)) {
    Task.find({ userId: userId }, cb);
  } else if (arguments.length === 3 && _.isString(userId) && _.isArray(projectsArray) && _.isFunction(cb)) {
    Task.find({ userId: userId, 'appearances.projectId': { $in: projectsArray } }, cb);
  } else {
    cb(new Error('somethin funky in the tasks arguments'));
  }
};

exports.getContext = function (userId, contextId, cb) {
  Context.find({ userId: userId, _id: contextId }, cb);
};

exports.getContexts = function (userId, cb) {
  Context.find({ userId: userId }, function (err, results) {
    //console.log(results);

    // var finalObject = [];

    // results.forEach(function(obj) {
    //   //console.log(obj.toObject());
    //   finalObject.push(obj.toObject());
    // });

    // console.log(finalObject);

    // cb(err, finalObject);

    cb(err, results);
  });
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
