'use strict';

var async = require('async');
var _ = require('underscore');
var libContext = require('./model');
var sanitize = libContext.sanitize;

var e, app, mongoose, Context;
exports.use = function (appInstance, mongooseInstance) {
  app = appInstance;
  e = app.errors;

  mongoose = mongooseInstance;
  Context = libContext.Schema(mongoose);

  return Context;
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

      if (contexts.length > 1) {
        cb(new Error('duplicate context ids'));
      }

      cb(err, contexts[0]);
    });
};

exports.getContextsByIds = function (userId, contextIds, cb) {
  Context
    .find({ userId: userId })
    .where('_id').in(contextIds)
    .sort('order')
    .exec(function (err, contexts) {
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
