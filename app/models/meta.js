// Example model

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var Meta = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post'},
  favorite: { type: Boolean, default: false },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date },
  cancelTime: {type: Date},
});

mongoose.model('Meta', Meta);

