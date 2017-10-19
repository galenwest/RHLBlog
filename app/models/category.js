// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  postNum: {type: Number, default: 0},
  created: { type: Date },
});

mongoose.model('Category', CategorySchema);

