'use strict';

var async = require('async'),
    _ = require('underscore');
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

    // just gotta get at the objects themselves
    // they're in array wrappers at the moment: [ [context1], [context2], [context3] ]
    // i want [context1, context2, context3]
    var contexts = _.map(results, function (context) {
      return context[0];
    });

    cb(err, userId, contexts);
  });
}

function seedProjects (userId, contexts, cb) {
  if (!userId) {
    cb(new Error('no userid in seedProjects'));
    return;
  }

  function generateProjects (callback) {
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

    return [context1Projects, context2Projects, context3Projects];
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
            projectGroups[projectGroupsIdx][projectIdx] = savedProject;
            callback(err, savedProject.id);
          });
        });
      });

    });

    // returns projects array ordered by context index with saved projects inside (they now have _ids)
    async.parallel(asyncFuncs, function (err, unusedCallback) {
      callback(err, projectGroups);
    });
  }

  function linkProjectToContext (context) {
    return function (callback) {
        context.save(callback);
      };
  }

  // projects are saved to their contexts according to their positions in array indices
  function addProjectsToContexts (contexts, projectGroups, callback) {
    var projects = [], // an array of saved projects to return to the callback at the end
        asyncFuncs = [];

    _.forEach(projectGroups, function (projects, groupIdx) {
      var pLen = projects.length - 1;

      _.forEach(projects, function (project, idx) {
        console.log('context section', contexts[groupIdx]);
        contexts[groupIdx].projects.push(project);
        projects.push(project);
        if (idx === pLen) {
          // return a function for async.parallel to save the context
          asyncFuncs.push( linkProjectToContext(contexts[groupIdx]) );
        }
      });
    });

    async.parallel(asyncFuncs, function (err, /* unused */ contexts) {
      callback(err, projects);
    });
  }

  async.auto({
    createProjects: function (callback) {
      callback(null, generateProjects());
    },
    saveProjects: ['createProjects', function (callback, results) {
      saveEachProject(results.createProjects, callback);
    }],
    modifyContexts: ['saveProjects', function (callback, results) {
      addProjectsToContexts(contexts, results.saveProjects, callback);
    }],
  },

  function(err, results) {
    console.log('project results', results.modifyContexts);
    cb(err, userId, results.modifyContexts); // returns an array of saved projects
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
    for (var i = 0; i < 15; i++) {
      tasks.push(taskFactory(i));
    }

    async.parallel(
      tasks,

      //  returns an ordered list of tasks (in order of when the task was defined in async.parallel)
      function (err, results) {
      //  console.log('task results', results);
        callback(err, results);
      }
    );
  }

  function modifyChildren (tasks, projects, callback) {

    console.log('all?', tasks, projects);

    callback(null, tasks);
    // task.projects.push()

    // task.save(callback);
  }

  var pro = [
    // task 0
    [
      // appearances
      {
        projectIdx: 1, // projects[projectIdx].id
        path: [1, 2], // ',' + _.map(path, function (idx) { return projects[idx].id; }).join(',');
        children: [1, 2], // _.map(tasks, function (idx) { return tasks[idx].id); });
      },
      {

      }
    ],
    // task 1
    [

    ],
  ];

  console.log(pro);

  async.auto({
    baseTasks: function (callback) {
      generateTasks(callback);
    },
    linkTasks: ['baseTasks', function(callback, results) {
      modifyChildren(results.baseTasks, projects, callback);
    }],
    // secondLevel: ['baseTasks', function (callback, results) {
    //   var baseResults = results.baseTasks;

    //   async.parallel([

    //   ],
    //   function (err, results) {
    //     callback(err, results);
    //   });
    // }],
    // thirdLevel: ['secondLevel', function (callback, results) {
    //   var lvlTwoResults = results.secondLevel;

    //   async.parallel([

    //   ],
    //   function (err, results) {
    //     callback(err, results);
    //   });
    // }],
  },
  function (err, results) {
    cb(err, results.linkTasks);
  });

}
