'use strict';

module.exports = function(mongoose, textSearch) {
  // index on { userId, projects [] }
  //          { userId, title }
  //          { userId, desc }

  // fields { userId, projects [], groups [], title, desc, }

  // create our schema
  var TaskSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    projects: { type: [mongoose.Schema.Types.ObjectId], required: true },
    tags: [mongoose.Schema.Types.ObjectId],
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
     // date: { type: Date, default: Date.now },
  });

  // give our schema text search capabilities
  // gameSchema.plugin(textSearch);

  // // add text indexes to the tags array
  // gameSchema.index({ title: 'text' });
  // gameSchema.index({ description: 'text' });
  // gameSchema.index({ tags: 'text' });

  TaskSchema.set('toObject', {});
  TaskSchema.set('toJSON', {});

  TaskSchema.options.toObject.transform = TaskSchema.options.toJSON = function (doc, ret, options) {
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

  return mongoose.model('Task', TaskSchema);
};
