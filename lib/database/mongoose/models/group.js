'use strict';

module.exports = function (mongoose) {
  // index on { userId, projectId, path, type }
  // fields { userId, projectId, path, type, folOpen, depOpen, order, children [], leader }

  // create our schema
  var GroupSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    path: { type: String, required: true },
    type: { type: Number, required: true }, // 0 = dependent, 1 = follower
    folOpen: { type: Boolean, required: true },
    depOpen: { type: Boolean, required: true },
    order: { type: Number, required: true },
    children: [mongoose.Schema.Types.ObjectId],
    leader: { type: mongoose.Schema.Types.ObjectId, required: true },
  });

  GroupSchema.set('toObject', {});
  GroupSchema.set('toJSON', {});

  GroupSchema.options.toObject.transform = GroupSchema.options.toJSON = function (doc, ret, options) {
    // remove sensitive/extra properties before packing it for Backbone
    delete ret.userId;
    delete ret.projectId;
    delete ret.path;

    // can also just return what I want
    // return {
    //   projects: ret.projects,
    //   order: ret.order
    //   title: ret.title
    //   desciption: ret.description,
    //   someProp: ret.title + ret.description,
    // }
  };


  return mongoose.model('Group', GroupSchema);
};
