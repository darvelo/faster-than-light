'use strict';

var _ = require('underscore');
var validator = require('validator');
var UserValidator = require('../../../validators').user;

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

  // do XSS rewriting

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
    var err = new Error('something went wrong');

    console.log('checking user: ', this);
    // console.log('checking userSchema: ', UserSchema);

    if (this.lastContexts.toString() === 'null') {
      console.log('lastContexts = null');
    }

    // console.log('uservalidator: ', UserValidator(this));

    next(new Error('nuh uh son'));
  });

  UserSchema.post('save', function (doc) {
    console.log('%s has been saved', doc._id);
  });

  return mongoose.model('User', UserSchema);
};
