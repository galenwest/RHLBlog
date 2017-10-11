var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post'),
  Meta = mongoose.model('Meta'),
  Comment = mongoose.model('Comment');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/posts/1');
});

router.get('/:page', function (req, res, next) {
  var user = req.user;
  var keyword = req.query.keyword;
  var conditions = { published: true };
  if (keyword) {
    conditions ={
      published: true,
      $or: [
          {title: new RegExp(keyword.trim(), 'i')},
          {content: new RegExp(keyword.trim(), 'i')}
      ]
    };
  }

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

  Post.count(conditions)
    .exec(function (err, count) {
      var pageSize = 8;
      var pageCount = Math.ceil(count / pageSize);
      var skip = (pageNum - 1) * pageSize;
      if (pageCount !== 0 && pageNum > pageCount) {
        pageNum = pageCount;
        res.redirect('/posts/' + pageNum);
        return;
      }
      Post.find(conditions)
        .sort({ _id: -1 })
        .limit(pageSize)
        .skip(skip)
        .populate('author')
        .populate('category')
        .exec(function (err, posts) {
          if (err) return next(err);
          // return res.json(posts);
          var isFavoUser = [];
          var metaIds = [];
          if (user) {
            for (var index in posts) {
              var post = posts[index];
              if (post.favorite && post.favorite !== undefined && post.favorite instanceof Array && post.favorite.length > 0) {
                biaoji:
                for (var indexU = 0; indexU < post.favorite.length; indexU++) {
                  var favoUser = post.favorite[indexU];
                  if (favoUser.fromUser.toString() === user._id.toString()) {
                    isFavoUser[index] = true;
                    metaIds[index] = favoUser.metaId;
                    break biaoji;
                  } else {
                    isFavoUser[index] = false;
                  }
                }
              } else {
                isFavoUser[index] = false;
              }
            }
          }
          res.render('blog/index', {
            posts: posts,
            isFavoUser: isFavoUser,
            metaIds: metaIds,
            pageNum: pageNum,
            pageCount: pageCount,
            keyword: keyword,
          });
        });
    });
});

// router.get('/category/:slug', function (req, res, next) {
//   res.redirect('/posts/category/' + req.params.slug + '/1');
// });

// router.get('/category/:slug/:page', function (req, res, next) {
//   var cateSlug = req.params.slug;

//   var pNum = parseInt(req.params.page, 10);
//   var pageNum = Math.abs(pNum);
//   if (isNaN(pNum) || pNum === 0) {
//     res.redirect('/posts/category/' + cateSlug + '/1');
//     return;
//   }
//   if (pNum < 0) {
//     res.redirect('/posts/category/' + cateSlug + '/' + pageNum);
//     return;
//   }

//   Category.findOne({ slug: cateSlug }).exec(function (err, category) {
//     if (err) {
//       return next(err);
//     }
//     var conditions = {};
//     // return res.json(category);
//     Post.find({category:category,published:true})
//       .sort({ _id: -1 })
//       .populate('author')
//       .populate('category')
//       .exec(function (err, posts) {
//         if (err) return next(err);
        
//         var pageSize = 6;
//         var pageCount = Math.ceil(posts.length / pageSize);
//         var skip = (pageNum - 1) * pageSize;
//         if (pageCount !== 0 && pageNum > pageCount) {
//           pageNum = pageCount;
//         }
//         res.render('blog/category', {
//           posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
//           pageNum: pageNum,
//           pageCount: pageCount,
//           category: category,
//         });
//       });
//   });
// })

router.get('/view/:id', function (req, res, next) {
  var user = req.user;
  if (!req.params.id) {
    return next(new Error('No post id provided!'));
  }
  var conditions = {};
  if (req.query.published !== 'false') {
    conditions.published = true;
  } else {
    conditions.published = false;
  }
  try {
    if (!req.query.published) {
      conditions.slug = req.params.id;
    } else {
      conditions._id = mongoose.Types.ObjectId(req.params.id);
    }
  } catch (err) {
    conditions.slug = req.params.id;
  }
  // return res.json(conditions);
  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function (err, post) {
      // return res.json(post);
      if (err) return next(err);
      Post.findOne({ _id: { '$gt': post._id }, published: true })
        .sort({ _id: 1 })
        .exec(function (err, nextPost) {
          if (err) return next(err);
          Post.findOne({ _id: { '$lt': post._id }, published: true })
            .sort({ _id: -1 })
            .exec(function (err, prePost) {
              if (err) return next(err);
              Comment.find({post:post})
                .populate('fromUser')
                .sort({ _id: -1 })
                .exec(function (err, comments) {
                  if (err) return next(err);
                  var isFavoUser = false;
                  var metaId = '';
                  if (user) {
                    if (post.favorite && post.favorite !== undefined && post.favorite instanceof Array && post.favorite.length > 0) {
                      biaoji:
                      for (var indexU = 0; indexU < post.favorite.length; indexU++) {
                        var favoUser = post.favorite[indexU];
                        if (favoUser.fromUser.toString() === user._id.toString()) {
                          isFavoUser = true;
                          metaId = favoUser.metaId;
                          break biaoji;
                        } else {
                          isFavoUser = false;
                        }
                      }
                    } else {
                      isFavoUser = false;
                    }
                  }
                  res.render('blog/view', {
                    post: post,
                    isFavoUser: isFavoUser,
                    metaId: metaId,
                    nextPost: nextPost,
                    prePost: prePost,
                    comments: comments,
                  });
                });
            });
        });
    });;
});

router.post('/comment/:slug', function (req, res, next) {
  if (!req.params.slug) {
    return next(new Error('No post slug provided!'));
  }
  // return res.json(req.params);
  var user = req.user;
  if (!user) {
    req.flash('error', '请登录后发布评论');
    return res.redirect('/posts/view/' + req.params.slug + '#commentform');
  }
  if (!req.body.comment) {
    req.flash('error', '请撰写评论后发布');
    return res.redirect('/posts/view/' + req.params.slug + '#commentform');
  }

  var conditions = {};
  conditions.published = true;
  conditions.slug = req.params.slug;

  Post.findOne(conditions)
    .exec(function (err, post) {
      if (err) return next(err);

      var comment = new Comment({
        post: post,
        fromUser: user,
        content: req.body.comment,
        meta: { favorite: 0 },
        created: new Date(),
      });
      comment.save(function (err, comment) {
        if (err) {
          req.flash('error', '评论发布失败');
          return res.redirect('/posts/view/' + post.slug + '#commentform');
        } else {
          var comment = comment._id;
          post.comments.unshift(comment);
          post.markModified('comments');
          post.save(function (err, post) {
            if (err) {
              req.flash('error', '评论发布失败');
              return res.redirect('/posts/view/' + post.slug + '#commentform');
            } else {
              req.flash('success', '评论发布成功');
              res.redirect('/posts/view/' + post.slug + '#' + comment);
            }
          });
        }
      });
    });
});

router.get('/favorite/:id', function (req, res, next) {
  if (!req.params.id) {
    return res.send(400, 'No post id provided!');
  }

  var user = req.user;
  if (!user) {
    return res.send(401, 'Please login!');
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

      var meta = new Meta({
        post: post,
        favorite: true,
        fromUser: user,
        created: new Date(),
      });
      meta.save(function (err, meta) {
        if (err) {
          return res.send(500, 'The server is having problems');
        } else {
          
          var favorite = {fromUser:user._id, metaId: meta._id};
          post.meta.favorite = post.meta.favorite ? post.meta.favorite + 1 : 1;
          post.favorite.unshift(favorite);
          post.markModified('meta');
          post.markModified('favorite');
          post.save(function (err) {
            // setTimeout(function () {
            if (err) return res.send(500, 'The server is having problems');
            else return res.send(200, {favorCount: post.meta.favorite, metaId: meta._id});
            // }, 5000);
          });
        }
      });
    });
});

router.get('/unfavorite/:id/:metaId', function (req, res, next) {
  if (!req.params.id) {
    return res.send(400, 'No post id provided!');
  }
  if (!req.params.metaId) {
    return res.send(400, 'No meta id provided!');
  }

  var user = req.user;
  if (!user) {
    return res.send(401, 'Please login!');
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
      Meta.findOne({_id: req.params.metaId})
        .exec(function (err, meta) {
          if (err) {
            return res.send(500, 'The server is having problems');
          } else {
            if (post.favorite && post.favorite !== undefined && post.favorite instanceof Array && post.favorite.length > 0) {
              for (var i = 0; i < post.favorite.length; i++) {
                if (post.favorite[i].metaId.toString() == meta._id.toString()) {
                  post.favorite.splice(i,1);
                }
              }
            } else {
              return res.send(200, post.meta.favorite);
            }

            post.meta.favorite = post.meta.favorite ? post.meta.favorite - 1 : 0;
            post.markModified('meta');
            post.markModified('favorite');
            post.save(function (err) {
              if (err) {
                return res.send(500, 'The server is having problems');
              } else {
                meta.favorite = false;
                meta.cancelTime = new Date();
                meta.markModified('favorite');
                meta.markModified('cancelTime');
                meta.save(function (err) {
                  // setTimeout(function () {
                  if (err) return res.send(500, 'The server is having problems');
                  else return res.send(200, post.meta.favorite);
                  // }, 5000);
                });
              }
            });
          }
        });
    });
});
