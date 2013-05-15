'use strict';

var _ = require('underscore');
var userValidator = require('../../../validators').user;
var scrub = require('../sanitize');

exports.sanitize = function (clientModel) {
  // clean a clientModel using a list of values the user cannot modify
  var invalidProps = [
    '__v',
    '_id',
    'id',
    'username',
    'hash',
    'salt',
  ];

  clientModel = _.omit(clientModel, invalidProps);

  if (_.isEmpty(clientModel.lastContexts)) {
    // for some reason mongoose won't save an empty object literal.. it keeps the previous value
    clientModel.lastContexts = [];
  }

  // recursively do XSS rewriting and HTML escaping
  scrub(clientModel);

  return clientModel;
};

exports.Schema = function(mongoose) {
  // create our schema
  var UserSchema = mongoose.Schema({
    username: { type: String, unique: true },
    lastContexts: {
      center: mongoose.Schema.Types.ObjectId,
      east: mongoose.Schema.Types.ObjectId,
      west: mongoose.Schema.Types.ObjectId,
      south: mongoose.Schema.Types.ObjectId,
      north: mongoose.Schema.Types.ObjectId,
    },
    menu: {
      size: Number,
      isClosed: Boolean,
    },
    paneSizes: {
      center: Number,
      east: Number,
      west: Number,
      south: Number,
      north: Number,
    },
    hash: String,
    salt: String,
  });

  UserSchema.index({ username: 1 });

  UserSchema.set('toObject', {});
  UserSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      // delete ret._id;
      // delete ret.__v;

      // can also just return what I want
      return {
        id: ret.username,
        lastContexts: ret.lastContexts,
        menu: ret.menu,
        paneSizes: ret.paneSizes,
        // someProp: ret.title + ret.description,
      };
    },
  });

  UserSchema.pre('save', function (next) {
    // this gives the document for validation with only
    // the properties that were exposed to the user.
    // Mongoose will remove any other properties not
    // in the schema if this object passes validation.
    var plainObject = this.toJSON();
    var err = userValidator(plainObject);

    // err is null if validation passed,
    // is a custom ValidationError if failed
    next(err);
  });

  UserSchema.post('save', function (doc) {
    console.log('User %s has been saved', doc._id);
  });

  return mongoose.model('User', UserSchema);
};
