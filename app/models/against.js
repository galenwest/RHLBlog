// Example model

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var AgainstSchema = new Schema({
  comment: { type: Schema.Types.ObjectId, ref: 'Comment'},
  isagainst: { type: Boolean, default: false },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date },
  cancelTime: {type: Date},
});

mongoose.model('Against', AgainstSchema);

