var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/posts/1');
});

router.get('/:page', function (req, res, next) {
  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  if (isNaN(pNum) || pNum === 0) {
    res.redirect('/posts/1');
    return;
  }
  if (pNum < 0) {
    res.redirect('/posts/' + pageNum);
    return;
  }

  Post.count({ published: true })
    .exec(function (err, count) {
      var pageSize = 8;
      var pageCount = Math.ceil(count / pageSize);
      var skip = (pageNum - 1) * pageSize;
      if (pageCount !== 0 && pageNum > pageCount) {
        pageNum = pageCount;
        res.redirect('/posts/' + pageNum);
        return;
      }
      // return res.json({ 'skip': skip, 'pageNum': pageNum, 'params': req.params.page, 'pageCount': pageCount });
      Post.find({ published: true })
        .sort({ _id: -1 })
        .limit(pageSize)
        .skip(skip)
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
