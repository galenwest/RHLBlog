var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/:page', function (req, res, next) {
  Post.count({ published: true })
    .exec(function (err, count) {
      var pageSize = 8;
      var pageNum = Math.abs(parseInt(req.params.page || 1, 10));
      var pageCount = Math.ceil(count / pageSize);
      if (pageNum > pageCount) {
        pageNum = pageCount;
      }
      Post.find({ published: true })
        .sort({_id: -1})
        .limit(pageSize)
        .skip((pageNum - 1) * pageSize)
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

router.get('/view', function (req, res, next) {
});

router.get('/comment', function (req, res, next) {
});

router.get('/favourite', function (req, res, next) {
});
