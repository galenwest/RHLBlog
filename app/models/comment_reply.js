// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CommentReplySchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post'},
  comment: { type: Schema.Types.ObjectId, ref: 'Comment'},
  content: { type: String, required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  shielded: { type: Boolean, default: false },
  created: { type: Date },
});

mongoose.model('CommentReply', CommentReplySchema);

