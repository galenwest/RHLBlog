var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
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
          if (err) return next(err);
          // return res.json(posts);
          res.render('blog/index', {
            posts: posts,
            pageNum: pageNum,
            pageCount: pageCount,
            pretty: true,
          });
        });
    });
});

router.get('/category/:name', function (req, res, next) {
  res.redirect('/posts/category/'+req.params.name+'/1');
});

router.get('/category/:name/:page', function (req, res, next) {
  var cateName = req.params.name;
  
  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  if (isNaN(pNum) || pNum === 0) {
    res.redirect('/posts/category/' + cateName + '/1');
    return;
  }
  if (pNum < 0) {
    res.redirect('/posts/category/' + cateName + '/' + pageNum);
    return;
  }
  
  Category.find({name:cateName}).exec(function (err, category) {
    if (err) {
      return next(err);
    }
    Post.find({category: category, published: true})
    .sort({_id: 1})
    .populate('author')
    .populate('category')
    .exec(function (err, posts) {
      if (err) return next(err);
      // return res.json(posts);

      var pageSize = 6;
      var pageCount = Math.ceil(posts.length / pageSize);
      var skip = (pageNum - 1) * pageSize;
      if (pageCount !== 0 && pageNum > pageCount) {
        pageNum = pageCount;
      }

      res.render('blog/category', {
        posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
        pageNum: pageNum,
        pageCount: pageCount,
        cateName: cateName,
        pretty: true,
      });
    });
  });
})

router.get('/view', function (req, res, next) {
});

router.get('/comment', function (req, res, next) {
});

router.get('/favourite', function (req, res, next) {
});
