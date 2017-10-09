// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var md5 = require('md5');

var UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true },
  nick: { type: String, required: true },
  password: { type: String, required: true },
  authority: { type: String, required: true },
  created: { type: Date },
});

UserSchema.methods.verifyPassword = function (password) {
  return md5(password) === this.password;
}

UserSchema.methods.encryptPassword = function (password) {
  return md5(password);
}

mongoose.model('User', UserSchema);

