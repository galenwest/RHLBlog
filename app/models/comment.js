// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post'},
  content: { type: String, required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  shielded: { type: Boolean, default: false },
  meta: { type: Schema.Types.Mixed },
  support: [Schema.Types.Mixed],
  against: [Schema.Types.Mixed],
  reply: [Schema.Types.Mixed],
  created: { type: Date },
});

mongoose.model('Comment', CommentSchema);

