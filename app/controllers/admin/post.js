var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  slug = require('slug'),
  pinyin = require("node-pinyin"),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post'),
  User = mongoose.model('User');

module.exports = function (app) {
  app.use('/admin/posts', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/admin/posts/1');
});

router.get('/add', function (req, res, next) {
  res.render('admin/post/add', {
    pretty: true,
  });
});

router.post('/add', function (req, res, next) {
  // return res.jsonp(req.body);
  req.checkBody('title', '文章标题不能为空').notEmpty();
  req.checkBody('category', '请选择文章类别').notEmpty();
  req.checkBody('content', '文章内容不能为空').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.render('admin/post/add', {
      errors: errors,
      title: req.body.title,
      content: req.body.content,
    })
  }

  var title = req.body.title.trim();
  var category = req.body.category.trim();
  var content = req.body.content;
  var published = req.body.published;

  if (published === 'true') {
    published = true;
  } else {
    published = false;
  }

  var pyTitle = pinyin(title, {
    style: 'toneWithNumber',
  });
  var slugTitle = slug(pyTitle);
  Post.find({ slug: slugTitle },
    function (err, post) {
      if (err) return next(err);
      if (post.length > 0) {
        req.flash('error', '文章标题已经存在');
        res.redirect('/admin/posts/add');
      } else {
        User.findOne({}, function (err, author) {
          if (err) return next(err);
          var post = new Post({
            title: title,
            slug: slugTitle,
            category: category,
            content: content,
            author: author,
            meta: { favorite: 0 },
            created: new Date(),
            comments: [],
            published: published,
          });
          post.save(function (err, post) {
            if (err) {
              req.flash('error', '文章保存失败');
              res.redirect('/admin/posts/add');
            } else {
              req.flash('info', '文章保存成功');
              res.redirect('/admin/posts');
            }
          });
        });
      }
    });
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

  var conditions = {};
  if (req.query.category) {
    conditions.category = req.query.category.trim();
  }
  if (req.query.author) {
    conditions.author = req.query.author.trim();
  }

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

  User.find({}, function (err, authors) {
    Post.count(conditions)
      .exec(function (err, count) {
        var pageSize = 12;
        var pageCount = Math.ceil(count / pageSize);
        var skip = (pageNum - 1) * pageSize;
        if (pageCount !== 0 && pageNum > pageCount) {
          pageNum = pageCount;
          res.redirect('/admin/posts/' + pageNum);
          return;
        }
        Post.find(conditions)
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
              authors: authors,
              filter: {
                category: req.query.category || '',
                author: req.query.author || '',
              },
              pretty: true,
            });
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
  Post.remove({ _id: req.params.id })
    .exec(function (err, rowsRemoved) {
      if (err) return next(err);
      if (rowsRemoved) {
        req.flash('success', '文章删除成功');
      } else {
        req.flash('failure', '文章删除失败');
      }
      res.redirect('/admin/posts/' + req.query.page + '?sortby=' + req.query.sortby + '&sortdir=' + req.query.sortdir + '&category=' + req.query.category + '&author=' + req.query.author);
    })
});

router.get('/published/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('no post id provided'));
  }
  var conditions = {};
  conditions.published = false;
  try {
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function (err, post) {
      if (err) return next(err);
      post.published = true;
      post.markModified('published');
      post.save(function (err, published) {
        if (err) return next(err);
        if (published) {
          req.flash('success', '文章发布成功');
        } else {
          req.flash('failure', '文章发布失败');
        }
        res.redirect('/admin/posts/' + req.query.page + '?sortby=' + req.query.sortby + '&sortdir=' + req.query.sortdir + '&category=' + req.query.category + '&author=' + req.query.author);
      });
    });
})