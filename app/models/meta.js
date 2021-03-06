// Example model

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var PostMeta = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post'},
  favorite: { type: Boolean, default: false },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date },
  cancelTime: {type: Date},
});

mongoose.model('PostMeta', PostMeta);

