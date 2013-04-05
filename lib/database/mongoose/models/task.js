'use strict';

module.exports = function(mongoose, textSearch) {

  // TODO: Finish fleshing out the schema from database document

  // create our schema
  var ContextSchema = mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    projects: [mongoose.Schema.Types.ObjectId],
    tags: [mongoose.Schema.Types.ObjectId],
    order: Number,
    title: String,
    description: String,
     // date: { type: Date, default: Date.now },
  });

  // give our schema text search capabilities
  gameSchema.plugin(textSearch);

  // add text indexes to the tags array
  gameSchema.index({ title: 'text' });
  gameSchema.index({ description: 'text' });
  gameSchema.index({ tags: 'text' });

  return mongoose.model('Context', ContextSchema);
};
