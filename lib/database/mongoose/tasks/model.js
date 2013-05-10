'use strict';

var _ = require('underscore');
var validator = require('validator');
// var TaskValidator = require('../../../validators').task;

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

exports.Schema = function(mongoose, textSearch) {
  // index on { userId, appearances.projectId }
  //          { userId, title }
  //          { userId, desc }

  // fields { userId, projects [], groups [], title, desc, }

  // create our schema
  var TaskSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: String,
//    projects: { type: [mongoose.Schema.Types.ObjectId], required: true },
    appearances: [{
      // contextId: { type: mongoose.Schema.Types.ObjectId, required: true },
      projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
      path: { type: String, required: true, match: /^,/ },
      type: { type: Number, required: true, min: 0, max: 1 }, // 0 = dependent, 1 = follower
      folOpen: { type: Boolean, required: true },
      depOpen: { type: Boolean, required: true },
      order: { type: Number, required: true, min: 0 },
      children: [mongoose.Schema.Types.ObjectId],
      tags: [], //[mongoose.Schema.Types.ObjectId],
    }],
     // date: { type: Date, default: Date.now },
  });

  // give our schema text search capabilities
  // gameSchema.plugin(textSearch);

  // // add text indexes to the tags array
  // gameSchema.index({ title: 'text' });
  // gameSchema.index({ description: 'text' });
  // gameSchema.index({ tags: 'text' });

  TaskSchema.set('toObject', {});
  TaskSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      // delete ret.userId;
      // delete ret.__v;

      // can also just return what I want
      if ('function' === typeof doc.ownerDocument) {
        if (ret.projectId) {
          // working with a sub doc, 'appearances'
          return {
            projectId: ret.projectId,
            path: ret.path,
            type: ret.type,
            folOpen: ret.folOpen,
            depOpen: ret.depOpen,
            order: ret.order,
            children: ret.children,
            tags: ret.tags,
          };
        } else {
          // what other subdocument is there?
          throw new Error('another type of subdocument was referenced somehow');
        }
      }

      return {
        id: ret._id,
        title: ret.title,
        desciption: ret.description,
        appearances: ret.appearances,
        // someProp: ret.title + ret.description,
      };
    },
  });

  return mongoose.model('Task', TaskSchema);
};


/* test out text search */
/*
  // modules
  var mongoose = require('mongoose');
  var textSearch = require('mongoose-text-search');

  // create our schema
  var gameSchema = mongoose.Schema({
      name: String
    , tags: [String]
    , likes: Number
    , created: Date
  });

  // give our schema text search capabilities
  gameSchema.plugin(textSearch);

  // add a text index to the tags array
  gameSchema.index({ tags: 'text' });

  // test it out
  var Game = mongoose.model('Game', gameSchema);

  Game.create({ name: 'Super Mario 64', tags: ['nintendo', 'mario', '3d'] }, function (err) {
    if (err) return handleError(err);

    Game.textSearch('3d', function (err, output) {
      if (err) return handleError(err);

      var inspect = require('util').inspect;
      console.log(inspect(output, { depth: null }));

      // { queryDebugString: '3d||||||',
      //   language: 'english',
      //   results:
      //    [ { score: 1,
      //        obj:
      //         { name: 'Super Mario 64',
      //           _id: 5150993001900a0000000001,
      //           __v: 0,
      //           tags: [ 'nintendo', 'mario', '3d' ] } } ],
      //   stats:
      //    { nscanned: 1,
      //      nscannedObjects: 0,
      //      n: 1,
      //      nfound: 1,
      //      timeMicros: 77 },
      //   ok: 1 }
    });
  });
*/
