'use strict';

module.exports = function (mongoose) {
  // index on { userId, order }
  //          { userId, title }
  //          { userId, desc }

  // fields { userId, root_groups [], order, title, desc }

  // create our schema
  var ProjectSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rootGroups: [mongoose.Schema.Types.ObjectId],
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    // accessList: [ObjectId] // other userids, might want to accesslist Groups by path
  });

  ProjectSchema.set('toObject', {});
  ProjectSchema.set('toJSON', {});

  ProjectSchema.options.toObject.transform = ProjectSchema.options.toJSON = function (doc, ret, options) {
    // remove sensitive/extra properties before packing it for Backbone
    delete ret.userId;

    // can also just return what I want
    // return {
    //   projects: ret.projects,
    //   order: ret.order
    //   title: ret.title
    //   desciption: ret.description,
    //   someProp: ret.title + ret.description,
    // }
  };


  return mongoose.model('Project', ProjectSchema);
};
