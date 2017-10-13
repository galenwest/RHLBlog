// Example model

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var SupportSchema = new Schema({
  comment: { type: Schema.Types.ObjectId, ref: 'Comment'},
  issupport: { type: Boolean, default: false },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date },
  cancelTime: {type: Date},
});

mongoose.model('Support', SupportSchema);

