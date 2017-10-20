// Example model

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var Contact = new Schema({
  name: { type: String },
  email: { type: String },
  content: { type: String },
  created: { type: Date },
});

mongoose.model('Contact', Contact);

