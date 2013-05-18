'use strict';

var _ = require('underscore');
var contextValidator = require('../../../validators').context;
var scrub = require('../sanitize');

exports.sanitize = function (clientModel) {
  // clean a clientModel using a list of values the user cannot modify
  var invalidProps = [
    '__v',
    '_id',
    'id',
    'userId',
  ];

  clientModel = _.omit(clientModel, invalidProps);

  // recursively do XSS rewriting and HTML escaping
  scrub(clientModel);

  return clientModel;
};

exports.Schema = function (mongoose) {
  // index on { userId, order }
  //          { userId, title }
  //          { userId, desc }

  // fields { userId, projects [], order, title, desc}

  // create our schema
  var ContextSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    projects: [mongoose.Schema.Types.ObjectId],
    order: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    description: String,
    color: { type: String },
    // accessList: [ObjectId] // other userids
  });

  ContextSchema.set('toObject', {});
  ContextSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      // delete ret.userId;
      // delete ret.__v;

      // can also just return what I want
      return {
        id: ret._id,
        projects: ret.projects,
        order: ret.order,
        title: ret.title,
        description: ret.description,
        color: ret.color,
        // someProp: ret.title + ret.description,
      };
    },
  });

//  ContextSchema.set('toObject', { getters: true, virtuals: false });
//
//  http://localhost:8088/docs/api.html#document_Document-toObject
//  Note: if you call toObject and pass any options, the transform declared
//    in your schema options will not be applied. To force its application pass
//    transform: true
//
//    ContextSchema.set('toObject', { hide: 'secret _id', transform: true });
//    ContextSchema.options.toObject.transform = function (doc, ret, options) {
//      if (options.hide) {
//        options.hide.split(' ').forEach(function (prop) {
//          delete ret[prop];
//        });
//      }
//    }
//
//  Note: Transforms are applied to the document and each of its sub-documents.
//    To determine whether or not you are currently operating on a sub-document
//    you might use the following guard:
//
//    if ('function' == typeof doc.ownerDocument) {
//      //working with a sub doc
//    }

  ContextSchema.pre('save', function (next) {
    // this gives the document for validation with only
    // the properties that were exposed to the user.
    // Mongoose will remove any other properties not
    // in the schema if this object passes validation.
    var plainObject = this.toJSON();
    var err = contextValidator(plainObject);

    // err is null if validation passed,
    // is a custom ValidationError if failed
    next(err);
  });

  ContextSchema.post('save', function (doc) {
    console.log('User %s has been saved', doc._id);
  });

  return mongoose.model('Context', ContextSchema);
};
