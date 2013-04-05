'use strict';

module.exports = function (mongoose) {

  // create our schema
  var ContextSchema = mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    projects: [mongoose.Schema.Types.ObjectId],
    order: Number,
    title: String,
    description: String,
    // accessList: [ObjectId] // other userids
  });

  ContextSchema.set('toObject', {});
  ContextSchema.set('toJSON', {});

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
  ContextSchema.options.toObject.transform = ContextSchema.options.toJSON = function (doc, ret, options) {
    // remove sensitive/extra properties before packing it for Backbone
    delete ret.userId;
    delete ret.projects;

    // can also just return what I want
    // return {
    //   projects: ret.projects,
    //   order: ret.order
    //   title: ret.title
    //   desciption: ret.description,
    //   someProp: ret.title + ret.description,
    // }
  };


  return mongoose.model('Context', ContextSchema);
};
