// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CommentPCSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Comment' },
  child: { type: Schema.Types.ObjectId, ref: 'Comment' },
});

mongoose.model('CommentPC', CommentPCSchema);

