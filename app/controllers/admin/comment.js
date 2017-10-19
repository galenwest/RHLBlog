var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  slug = require('slug'),
  pinyin = require("node-pinyin"),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post');
var auth = require('./admin');

module.exports = function (app) {
  app.use('/admin/comments', router);
};

router.get('/', auth.requireLogin, function (req, res, next) {
  res.render('admin/comment/index', {
  });
});
