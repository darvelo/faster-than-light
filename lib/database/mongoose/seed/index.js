'use strict';

var async = require('async'),
    _ = require('underscore');
var inspect = require('util').inspect;

var User, Context, Project, Group, Task, username;

exports.use = function (u, c, p, g, t, user) {
  User = u;
  Context = c;
  Project = p;
  Group = g;
  Task = t;
  username = user;
};

exports.user = function (user) { username = user; };

exports.seed = function (req, res, next) {
  async.waterfall([
    seedUser,
    seedContexts,
    seedProjects,
    seedTasks,
    // seedGroups,
  ],

  function(err, results) {
    if (err) {
      console.log('err', err);
      next(err);
      return;
    }

    console.log('results', results);
    res.send(results);
  });
};

// seed database
function seedUser (cb) {
  if (username === undefined) {
    return cb(new Error('Username not defined!'));
  }

  User.find({ username : username }, function(err, results) {
    if (err) {
      cb(err);
      return;
    } else if (results.length) {
      cb(new Error('Username already exists. Needs to not exist to create stuff.'));
      return;
    }

    var user = new User({ username: username });
    user.save(function (err, user) {
      if (err) {
        return cb(err);
      }

      cb(err, user.id);
    });
  });
}

function seedContexts (userId, cb) {
  var context1 = new Context({
    userId: userId,
    projects: [],
    order: 1,
    title: 'First Context',
    description: 'This is my first one!! Woohoo!',
  });

  var context2 = new Context({
    userId: userId,
    projects: [],
    order: 2,
    title: 'Second Context',
    description: 'This is my second one! Woohoo!',
  });

  var context3 = new Context({
    userId: userId,
    projects: [],
    order: 3,
    title: 'Third Context',
    description: 'This is my third one. Woohoo.',
  });

  async.parallel([
    function(callback) {
      context1.save(callback);
    },
    function(callback) {
      context2.save(callback);
    },
    function(callback) {
      context3.save(callback);
    }
  ],
  function(err, results) {
    // any other processing that needs to be done here?
    console.log('context results', results);
    cb(err, userId, results);
  });
}

function seedProjects (userId, contexts, cb) {
  if (!userId) {
    cb(new Error('no userid in seedProjects'));
    return;
  }

  var type1 = {
    userId: userId,
    rootGroups: [],
    order: 0,
    title: 'First Project',
    description: 'This is my first one!! Woohoo!',
  };

  var type2 = {
    userId: userId,
    rootGroups: [],
    order: 1,
    title: 'Second Project',
    description: 'This is my second one! Woohoo!',
  };

  var type3 = {
    userId: userId,
    rootGroups: [],
    order: 2,
    title: 'Third Project',
    description: 'This is my third one. Woohoo.',
  };

  var context1Projects = [];
  var context2Projects = [];
  var context3Projects = [];

  context1Projects.push(new Project(type1));
  context1Projects.push(new Project(type2));
  context1Projects.push(new Project(type3));

  context2Projects.push(new Project(type1));
  context2Projects.push(new Project(type2));

  context3Projects.push(new Project(type1));


  function saveEachProject (arrays) {
    var arrFuncs = [],
        args = Array.prototype.slice.call(arguments, 0);

    if (!args.length) {
      arrFuncs.push(function (callback) { callback(new Error('not enough args!')); });
      return arrFuncs;
    }

    _.forEach(args, function (arg) {
      if (! _.isArray(arg)) {
        cb(new Error('project array is not an array!'));
        return;
      }

      _.forEach(arg, function (thingToSave) {
        if (! _.isArray(arg)) {
          cb(new Error('project array is not an array!'));
          return;
        }

        arrFuncs.push(function (callback) {
          thingToSave.save(function (err, project) {
            callback(err, project.id);
          });
        });
      });

    });

    console.log('arrFuncs', arrFuncs);
    return arrFuncs;
  }

  async.parallel(
    saveEachProject(context1Projects, context2Projects, context3Projects)
  ,
  function(err, results) {
    // any other processing that needs to be done here?
    console.log('project results', results);
    cb(err, userId, results);
  });
}

function seedTasks (userId, projects, cb) {
  if (!userId) {
    cb(new Error('no userid in seedTasks'));
    return;
  }

  if (! _.isArray(projects)) {
    cb(new Error('projects is not an array'));
    return;
  }

  var task1 = {
    userId: userId,
    projects: [],
    tags: [],
    order: 0,
    title: 'This is a task',
    description: 'Description!',
  };

  // TODO: Figure out if Groups concept can be scrapped and
  //       everything can be placed into documents in the Tasks collection.

  var tasks = {
    1: {
      parentId:
      projectId:
    },

    2:
    3:
  }
}

function seedGroups (userId, projects, tasks, cb) {
  if (!userId) {
    cb(new Error('no userid in seedGroups'));
    return;
  }

  if (! _.isArray(projects)) {
    cb(new Error('projects is not an array'));
    return;
  }

  var type1 = {
    userId: userId,
    projectId: projects[0].id,
    path: ',',
    type: 1,
    folOpen: true,
    depOpen: true,
    order: 0,
    children: [],
    leader: tasks[0].id
  };

}
