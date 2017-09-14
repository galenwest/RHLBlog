var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Post.find().populate('author').populate('category').exec(function (err, posts) {
    return res.json(posts);
    if (err) return next(err);
    res.render('blog/index', {
      title: 'Node Blog Home',
      posts: posts,
      pretty: true
    });
  });
});

router.get('/about', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err) return next(err);
    res.render('blog/index', {
      title: 'About Me',
      posts: posts,
      pretty: true
    });
  });
});

router.get('/contact', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err) return next(err);
    res.render('blog/index', {
      title: 'Contact Me',
      posts: posts,
      pretty: true
    });
  });
});
