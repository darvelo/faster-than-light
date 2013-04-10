'use strict';

module.exports = function (mongoose) {
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
    // accessList: [ObjectId] // other userids
  });

  ContextSchema.set('toObject', {});
  ContextSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      delete ret.userId;
      delete ret.__v;
      // can also just return what I want
      // return {
      //   projects: ret.projects,
      //   order: ret.order
      //   title: ret.title
      //   desciption: ret.description,
      //   someProp: ret.title + ret.description,
      // }
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



  return mongoose.model('Context', ContextSchema);
};
