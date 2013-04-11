'use strict';

module.exports = function(mongoose) {
  // fields { (_id = userId), lastContext, hashedPassword, salt }

  // create our schema
  var UserSchema = mongoose.Schema({
    username: { type: String, unique: true },
    lastContext: mongoose.Schema.Types.ObjectId,
    // hashedPassword: String,
    // salt: String,
  });

  UserSchema.index({ username: 1 });

  UserSchema.set('toObject', {});
  UserSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      delete ret._id;
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

  var User = mongoose.model('User', UserSchema);

  return User;
};
