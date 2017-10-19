// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date },
});

mongoose.model('Category', CategorySchema);

