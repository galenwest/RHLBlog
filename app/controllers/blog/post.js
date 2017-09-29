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

router.get('/category/:slug', function (req, res, next) {
  res.redirect('/posts/category/' + req.params.slug + '/1');
});

router.get('/category/:slug/:page', function (req, res, next) {
  var cateSlug = req.params.slug;

  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  if (isNaN(pNum) || pNum === 0) {
    res.redirect('/posts/category/' + cateSlug + '/1');
    return;
  }
  if (pNum < 0) {
    res.redirect('/posts/category/' + cateSlug + '/' + pageNum);
    return;
  }

  Category.findOne({ slug: cateSlug }).exec(function (err, category) {
    if (err) {
      return next(err);
    }
    var conditions = {};
    // return res.json(category);
    Post.find({category:category,published:true})
      .sort({ _id: 1 })
      .populate('author')
      .populate('category')
      .exec(function (err, posts) {
        if (err) return next(err);
        
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
          category: category,
          pretty: true,
        });
      });
  });
})

router.get('/view/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('No post id provided!'));
  }
  // return res.jsonp(req.query);
  var conditions = {};
  if (req.query.published !== 'false') {
    conditions.published = true;
  } else {
    conditions.published = false;
  }
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
      Post.findOne({ _id: { '$gt': post._id }, published: true, category: post.category })
        .sort({ _id: 1 })
        .exec(function (err, nextPost) {
          if (err) return next(err);
          Post.findOne({ _id: { '$lt': post._id }, published: true, category: post.category })
            .sort({ _id: -1 })
            .exec(function (err, prePost) {
              if (err) return next(err);
              // return res.json(prePost);
              res.render('blog/view', {
                post: post,
                nextPost: nextPost,
                prePost: prePost,
              });
            });
        });
    });;
});

router.post('/comment/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('No post id provided!'));
  }
  if (!req.body.author) {
    return next(new Error('请提供您的昵称'));
  }
  if (!req.body.email) {
    return next(new Error('请提供您的邮箱'));
  }
  if (!req.body.comment) {
    return next(new Error('请撰写评论后发布'));
  }

  var conditions = {};
  conditions.published = true;
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
      var comment = {
        author: req.body.author,
        email: req.body.email,
        comment: req.body.comment,
        created: new Date(),
        id: new Date().getTime(),
      };
      post.comments.unshift(comment);
      post.markModified('comments');
      post.save(function (err, post) {
        if (err) return next(err);
        else res.redirect('/posts/view/' + post.slug + '#' + comment.id);
      });
    });;
});

router.get('/favorite/:id', function (req, res, next) {
  if (!req.params.id) {
    return res.send(400, 'No post id provided!');
  }

  var conditions = {};
  conditions.published = true;
  try {
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function (err, post) {
      if (err) return res.send(500, 'The server is having problems');

      post.meta.favorite = post.meta.favorite ? post.meta.favorite + 1 : 1;
      post.markModified('meta');
      post.save(function (err) {
        // setTimeout(function () {
        if (err) return res.send(500, 'The server is having problems');
        else return res.send(200, post.meta.favorite);
        // }, 5000);
      });
    });
});
