// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CommentReplySchemaPC = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'CommentReplySchema'},
  child: { type: Schema.Types.ObjectId, ref: 'CommentReplySchema'},
});

mongoose.model('CommentReplyPC', CommentReplySchemaPC);

