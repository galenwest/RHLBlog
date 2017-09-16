var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Post.count({ published: true })
  .exec(function (err, count) {
    var pageSize = 8;
    var pageNum = 1;
    var pageCount = Math.ceil(count / pageSize);
    Post.find({ published: true })
      .sort({ _id: -1 })
      .limit(pageSize)
      .skip(0)
      .populate('author')
      .populate('category')
      .exec(function (err, posts) {
        // return res.json(posts);
        if (err) return next(err);
        res.render('blog/index', {
          posts: posts,
          pageNum: pageNum,
          pageCount: pageCount,
          pretty: true,
        });
      });
  });
});

router.get('/about', function (req, res, next) {
  res.render('blog/index', {
    title: 'About Me',
    posts: posts,
    pretty: true
  });
});

router.get('/contact', function (req, res, next) {
  res.render('blog/index', {
    title: 'Contact Me',
    posts: posts,
    pretty: true
  });
});
