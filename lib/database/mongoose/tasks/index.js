'use strict';

var async = require('async');
var _ = require('underscore');
var textSearch = require('mongoose-text-search');
var libTask = require('./model');
var sanitize = libTask.sanitize;

var e, app, mongoose, Task;
exports.use = function (appInstance, mongooseInstance) {
  app = appInstance;
  e = app.errors;

  mongoose = mongooseInstance;
  Task = libTask.Schema(mongoose /*, textSearch */);

  return Task;
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


