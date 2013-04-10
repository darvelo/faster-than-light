'use strict';

module.exports = function(mongoose, textSearch) {
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

  var Task = mongoose.model('Task', TaskSchema);

  // TODO: Use node-validator to validate stuff in all Schemas
  //
  // Task.schema.path('title').validate(function (value) {
  //   return /blue|green|white|red|orange|periwinkel/i.test(value);
  // }, 'Invalid title');
  //
  // Saving an invalid model will return an error object:
  //
  // var task = new Task({ title: 'grease'});
  //
  // task.save(function (err) {
  //   // err.errors.title is a ValidatorError object
  //
  //   console.log(err.errors.title.message) // prints 'Validator "Invalid title" failed for path title with value `grease`'
  //   console.log(String(err.errors.title)) // prints 'Validator "Invalid title" failed for path title with value `grease`'
  //   console.log(err.errors.title.type)  // prints "Invalid title"
  //   console.log(err.errors.title.path)  // prints "title"
  //   console.log(err.errors.title.value) // prints "grease"
  //   console.log(err.name) // prints "ValidationError"
  //   console.log(err.message) // prints "Validation failed"
  // });


  return Task;
};
