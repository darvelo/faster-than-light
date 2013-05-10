'use strict';

var async = require('async');
var _ = require('underscore');
var libProject = require('./model');
var sanitize = libProject.sanitize;

var e, app, mongoose, Project;
exports.use = function (appInstance, mongooseInstance) {
  app = appInstance;
  e = app.errors;

  mongoose = mongooseInstance;
  Project = libProject.Schema(mongoose);

  return Project;
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
