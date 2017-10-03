// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

 var md5 = require('md5');

var UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  created: { type: Date },
});


UserSchema.methods.verifyPassword = function (password) {
  return md5(password) === this.password;
}

mongoose.model('User', UserSchema);

