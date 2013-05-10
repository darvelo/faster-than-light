'use strict';

var mongoose = require('mongoose');

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


var users = require('./users');
var contexts = require('./contexts');
var projects = require('./projects');
var tasks = require('./tasks');

var batch = require('./batch');
var seedDB = require('./seed');


var e, app, UserSchema, ContextSchema, ProjectSchema, TaskSchema;
exports.use = function (appInstance) {
  app = appInstance;
  e = app.errors;

  UserSchema = users.use(app, mongoose);
  ContextSchema = contexts.use(app, mongoose);
  ProjectSchema = projects.use(app, mongoose);
  TaskSchema = tasks.use(app, mongoose);

  batch.use(app);
  seedDB.use(app);

  // this should be overhauled to use encapsulated methods of type app.db.[modelType].[method],
  // NOT directly using db schemas to do the job.
  seedDB.schemas(UserSchema, ContextSchema, ProjectSchema, TaskSchema);
};

exports.users = users;
exports.contexts = contexts;
exports.projects = projects;
exports.tasks = tasks;

exports.batch = batch;
exports.seed = seedDB.seed;
