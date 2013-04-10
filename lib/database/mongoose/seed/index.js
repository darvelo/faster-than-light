'use strict';

var async = require('async'),
    _ = require('underscore'),
    seedTaskLib = require('./seedTasks.js');

var inspect = require('util').inspect;

var User, Context, Project, Group, Task, username;

exports.use = function (u, c, p, g, t, un) {
  User = u;
  Context = c;
  Project = p;
  Group = g;
  Task = t;
  username = un;
};

exports.user = function (user) { username = user; };

exports.seed = function (req, res, next) {
  async.waterfall([
    seedUser,
    seedContexts,
    seedProjects,
    seedTasks,
  ],

  function(err, results) {
    if (err) {
      console.log('err', err);
      next(err);
      return;
    }

 //   console.log('results', results);
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

    // just gotta get at the objects themselves
    // they're in array wrappers at the moment: [ [context1, 1], [context2, 1], [context3, 1] ]
    // i want [context1, context2, context3]
    var contexts = _.chain(results)
                    .flatten()
                    .without(1) // for some reason the mongoose save function also gives an extra parameter with value 1
                    .value();

    cb(err, userId, contexts);
  });
}

function seedProjects (userId, contexts, cb) {
  if (!userId) {
    cb(new Error('no userid in seedProjects'));
    return;
  }

  function generateProjectGroups (callback) {
    var type1 = {
      userId: userId,
      rootTasks: [],
      order: 0,
      title: 'First Project',
      description: 'This is my first one!! Woohoo!',
    };

    var type2 = {
      userId: userId,
      rootTasks: [],
      order: 1,
      title: 'Second Project',
      description: 'This is my second one! Woohoo!',
    };

    var type3 = {
      userId: userId,
      rootTasks: [],
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
    context3Projects.push(new Project(type2));

    // returns projects array ordered by context index with saved projects inside (they now have _ids)
    callback(null, [context1Projects, context2Projects, context3Projects]);
  }


  function saveEachProject (projectGroups, callback) {
    var asyncFuncs = [];

    if (!projectGroups.length) {
      callback(new Error('not enough args!'));
      return;
    }

    _.forEach(projectGroups, function (projects, projectGroupsIdx) {
      if (! _.isArray(projects)) {
        asyncFuncs.push(function (callback) { callback(new Error('projects array in projectGroupsIdx ' + projectGroupsIdx + 'is not an array!')); });
        return;
      }

      _.forEach(projects, function (project, projectIdx) {
        asyncFuncs.push(function (callback) {
          project.save(function (err, savedProject) {
            // modifies projectGroups array so that the projects can now be referenced by _id
            projectGroups[projectGroupsIdx][projectIdx] = savedProject;
            callback(err, savedProject);
          });
        });
      });

    });

    async.parallel(asyncFuncs, function (err, projects) {
   //   console.log('projects', projects);
      callback(err, projects);
    });
  }

  function linkProjectToContext (context) {
    return function (callback) {
        context.save(callback);
      };
  }

  // projects are saved to their contexts according to their positions in array indices
  function addProjectsToContexts (contexts, projectGroups, callback) {
    //var projects2 = [], // an array of saved projects to return to the callback at the end
    var asyncFuncs = [];

    _.forEach(projectGroups, function (projects, groupIdx) {
      var pLen = projects.length - 1;

      _.forEach(projects, function (project, idx) {
        console.log('context section', contexts[groupIdx]);
        contexts[groupIdx].projects.push(project);
        //projects.push(project);
        if (idx === pLen) {
          // return a function for async.parallel to save the context
          asyncFuncs.push( linkProjectToContext(contexts[groupIdx]) );
        }
      });
    });

    async.parallel(asyncFuncs, function (err, /* unused */ contexts) {
      callback(err, contexts);
    });
  }

  async.auto({
    createProjectGroups: function (callback) {
      generateProjectGroups(callback);
    },
    saveProjects: ['createProjectGroups', function (callback, results) {
      saveEachProject(results.createProjectGroups, callback); // modifies the return value of createProjectGroups
    }],
    modifyContexts: ['saveProjects', function (callback, results) {
      addProjectsToContexts(contexts, results.createProjectGroups, callback); // uses saveProjects' modified projectGroups
    }],
  },

  function(err, results) {
    console.log('project results', results.modifyContexts);
    cb(err, userId, results.saveProjects); // returns an array of saved projects
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

  function taskFactory (i) {
    return function (callback) {
      Task.create({
        userId: userId,
        title: 'This is task' + i,
        description: 'Description!',
        appearances: [
         // {
          //   projectId: projects[0].id,
          //   path: ',',
          //   type: 1,
          //   folOpen: true,
          //   depOpen: true,
          //   order: 0,
          //   children: [],
          //   tags: [],
          // },
        ],
      },
      function (err, result) {
        // console.log('task', result)
        callback(err, result);
      });
    };
  }

  function generateTasks (callback) {
    var tasks = [];
    var appearancesByTask = seedTaskLib.appearances;

    for (var i = 0; i < seedTaskLib.numTasks; i++) {
      tasks.push(taskFactory(i));
    }

    async.parallel(
      tasks,

      //  returns an ordered list of tasks (in order of when the task was defined in async.parallel)
      function (err, tasks) {
      //  console.log('task results', results);
        callback(err, tasks, appearancesByTask);
      }
    );
  }

  function modifyAppearances (tasks, appearancesByTask, projects, callback) {
    // callback(null, tasks);
    // return;
    // console.log('modifyAppearances', tasks);
    // console.log('appearancesByTask', appearancesByTask);
    // console.log('projects', projects);

    _.forEach(appearancesByTask, function (appearances, idx) {
  //    console.log('appearances', appearances, idx);
      var appearancesArray = _.map(appearances, function (appearance) {
          //console.log('appearance', appearance.projectIdx);
          //console.log('project', projects[appearance.projectIdx].id);
        var object = {
          projectId: projects[appearance.projectIdx].id,
          path: _.isEmpty(appearance.path) ? ',' : _.reduce(appearance.path, function (memo, i) { return memo + ',' + tasks[i].id; }, ''),
          children: _.map(appearance.children, function (i) { return tasks[i].id; }),
          type: appearance.type,
          folOpen: appearance.folOpen,
          depOpen:appearance.depOpen,
          order: appearance.order,
          tags: appearance.tags,
        };

    //    console.log('object', object);
        return object;
      });

      tasks[idx].appearances = appearancesArray;
    });
    //console.log('all?', tasks, projects);

    callback(null, tasks);
  }

  // projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  // path: { type: String, required: true, match: /^,/ },
  // type: { type: Number, required: true, min: 0, max: 1 }, // 0 = dependent, 1 = follower
  // folOpen: { type: Boolean, required: true },
  // depOpen: { type: Boolean, required: true },
  // order: { type: Number, required: true, min: 0 },
  // children: [mongoose.Schema.Types.ObjectId],
  // tags: [mongoose.Schema.Types.ObjectId],

  function generateSaveCallback (task) {
    return function (callback) {
      // If you simply task.save(callback), you'll get arguments (err, task, 1)
      // For some reason Mongoose adds a 1 argument to the end.. which will mess up further processing.
      // The solution is to use an anonymous function to callback(err, task) specifically,
      // or to task.save(callback) and elsewhere use underscore's _.flatten() and _.without(1), respectively, on the async.method() results.
      task.save(function (err, task) {
        callback(err, task);
      });
    };
  }

  function saveModifiedTasks (tasks, callback) {
    var asyncFuncs = _.map(tasks, function (task) {
      return generateSaveCallback(task);
    });

    async.parallel(asyncFuncs, function (err, tasks) {
      callback(err, tasks);
    });
  }

  async.auto({
    baseTasks: function (callback) {
      generateTasks(callback);
    },
    linkTasks: ['baseTasks', function (callback, results) {
      //console.log('typeof results basetasks', results.baseTasks[0], 'more stuff', results.baseTasks[1]);
      modifyAppearances(results.baseTasks[0], results.baseTasks[1], projects, callback);
    }],
    saveTasks: ['linkTasks', function (callback, results) {
      saveModifiedTasks(results.linkTasks, callback);
    }],
  },
  function (err, results) {
    console.log('saveTasks', results.saveTasks);
    cb(err, results.saveTasks); // saveTasks has an array of arrays of tasks [task1, task 2, etc]
  });

}
