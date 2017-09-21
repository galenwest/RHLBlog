var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/admin/posts', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/admin/posts/1');
});

router.get('/:page', function (req, res, next) {
  var sortby = req.query.sortby ? req.query.sortby : 'created';
  var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';

  if (['title', 'category', 'author', 'created', 'meta.favorite', 'comments', 'published'].indexOf(sortby) === -1) {
    sortby = 'created';
  }
  if (['desc', 'asc'].indexOf(sortdir) === -1) {
    sortdir = 'desc';
  }

  var sortObj = {};
  sortObj[sortby] = sortdir;

  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  if (isNaN(pNum) || pNum === 0) {
    res.redirect('/admin/posts/1');
    return;
  }
  if (pNum < 0) {
    res.redirect('/admin/posts/' + pageNum);
    return;
  }

  Post.count({ published: true })
    .exec(function (err, count) {
      var pageSize = 12;
      var pageCount = Math.ceil(count / pageSize);
      var skip = (pageNum - 1) * pageSize;
      if (pageCount !== 0 && pageNum > pageCount) {
        pageNum = pageCount;
        res.redirect('/admin/posts/' + pageNum);
        return;
      }
      // return res.json({ 'skip': skip, 'pageNum': pageNum, 'params': req.params.page, 'pageCount': pageCount });
      Post.find({ published: true })
        .sort(sortObj)
        .limit(pageSize)
        .skip(skip)
        .populate('author')
        .populate('category')
        .exec(function (err, posts) {
          if (err) return next(err);
          // return res.json(posts);
          res.render('admin/post/index', {
            posts: posts,
            pageNum: pageNum,
            pageCount: pageCount,
            sortdir: sortdir,
            sortby: sortby,
            pretty: true,
          });
        });
    });
});

router.get('/edit/:id', function (req, res, next) {
});

router.post('/edit/:id', function (req, res, next) {
});

router.get('/delete/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('no post id provided'));
  }
  Post.remove({_id: req.params.id})
  .exec(function (err, rowsRemoved) {
    if (err) return next(err);
    if (rowsRemoved) {
      req.flash('success', '文章删除成功');
    } else {
      req.flash('failure', '文章删除失败');
    }
    res.redirect('/admin/posts');
  })
});
