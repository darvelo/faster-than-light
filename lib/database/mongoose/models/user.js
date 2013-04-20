'use strict';

module.exports = function(mongoose) {
  // fields { (_id = userId), lastContext, hashedPassword, salt }

  // create our schema
  var UserSchema = mongoose.Schema({
    username: { type: String, unique: true },
    lastContexts: {
      center: mongoose.Schema.Types.ObjectId,
      east: mongoose.Schema.Types.ObjectId,
      west: mongoose.Schema.Types.ObjectId,
      south: mongoose.Schema.Types.ObjectId,
      north: mongoose.Schema.Types.ObjectId,
    },
    paneSizes: {
      center: Number,
      east: Number,
      west: Number,
      south: Number,
      north: Number,
    }
    // hashedPassword: String,
    // salt: String,
  });

  UserSchema.index({ username: 1 });

  UserSchema.set('toObject', {});
  UserSchema.set('toJSON',
  {
    transform: function (doc, ret, options) {
      // remove sensitive/extra properties before packing it for Backbone
      // delete ret._id;
      // delete ret.__v;

      // can also just return what I want
      return {
        id: ret.username,
        lastContexts: ret.lastContexts,
        paneSizes: ret.paneSizes,
        // someProp: ret.title + ret.description,
      };
    },
  });

  var User = mongoose.model('User', UserSchema);

  return User;
};
