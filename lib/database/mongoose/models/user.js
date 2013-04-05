'use strict';

module.exports = function(mongoose) {

  // create our schema
  var UserSchema = mongoose.Schema({
    username: { type: String, unique: true },
    // lastContext: mongoose.Schema.Types.ObjectId,
    // hashedPassword: String,
    // salt: String,
  });

  UserSchema.index({ username: 1 });


  return mongoose.model('User', UserSchema);
};
