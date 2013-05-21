'use strict';

var _ = require('underscore');
var validator = require('validator');
// var ProjectValidator = require('../../../validators').project;

exports.sanitize = function (clientModel) {
  // clean a clientModel using a list of values the user cannot modify
  var invalidProps = [
    '__v',
    '_id',
    'id',
    'userId',
  ];

  clientModel = _.omit(clientModel, invalidProps);

  // do XSS rewriting

  return clientModel;
};

exports.Schema = function (mongoose) {
  // index on { userId, order }
  //          { userId, title }
  //          { userId, desc }

  // fields { userId, root_groups [], order, title, desc }

  // create our schema
  var ProjectSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    children: [mongoose.Schema.Types.ObjectId],
    order: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    description: String,
    // accessList: [ObjectId] // other userids, might want to accesslist Groups by path
  });

  ProjectSchema.set('toObject', {});
  ProjectSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      // delete ret.userId;
      // delete ret.__v;

      // can also just return what I want
      return {
        id: ret._id,
        children: ret.children,
        order: ret.order,
        title: ret.title,
        description: ret.description,
        // someProp: ret.title + ret.description,
      };
    },
  });

  return mongoose.model('Project', ProjectSchema);
};
