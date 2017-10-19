var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post'),
  Comment = mongoose.model('Comment');

module.exports = function (app) {
  app.use('/category', router);
};

router.get('/view/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('No post id provided!'));
  }
  var user = req.user;
  // return res.jsonp(req.query);
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
  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec(function (err, post) {
      // return res.json(post);
      if (err) return next(err);
      Post.findOne({ _id: { '$gt': post._id }, published: true, category: post.category })
        .sort({ _id: 1 })
        .exec(function (err, nextPost) {
          if (err) return next(err);
          Post.findOne({ _id: { '$lt': post._id }, published: true, category: post.category })
            .sort({ _id: -1 })
            .exec(function (err, prePost) {
              if (err) return next(err);
              if (err) return next(err);
              Comment.find({post:post, shielded: false})
                .populate('fromUser')
                .sort({ _id: -1 })
                .exec(function (err, comments) {
                  if (err) return next(err);
                  var isFavoUser = false;
                  var metaId = '';
                  var isSupportUser = []; //该文章下所有评论当前用户是否支持列表，前端用来判断展示用
                  var supportId = [];
                  var isAgainstUser = [];
                  var againstId = [];
                  var ballot = [];
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
                    
                    for (var index in comments) {
                      var comment = comments[index];
                      if (comment.support && comment.support !== undefined && comment.support instanceof Array && comment.support.length > 0) {
                        biaojiB:
                        for (var indexS = 0; indexS < comment.support.length; indexS++) {
                          var supportUser = comment.support[indexS];
                          if (supportUser.fromUser.toString() === user._id.toString()) {
                            isSupportUser[index] = true;
                            supportId[index] = supportUser.supportId;
                            break biaojiB; //该评论所有的支持记录中有该用户的话，跳过剩下记录的遍历，进入下一个评论的支持记录的遍历
                          } else {
                            isSupportUser[index] = false;
                          }
                        }
                      } else {
                        isSupportUser[index] = false;
                      }

                      if (comment.against && comment.against !== undefined && comment.against instanceof Array && comment.against.length > 0) {
                        biaojiC:
                        for (var indexS = 0; indexS < comment.against.length; indexS++) {
                          var againstUser = comment.against[indexS];
                          if (againstUser.fromUser.toString() === user._id.toString()) {
                            isAgainstUser[index] = true;
                            againstId[index] = againstUser.againstId;
                            break biaojiC; //该评论所有的反对记录中有该用户的话，跳过剩下记录的遍历，进入下一个评论的反对记录的遍历
                          } else {
                            isAgainstUser[index] = false;
                          }
                        }
                      } else {
                        isAgainstUser[index] = false;
                      }

                      if (isSupportUser[index] == false && isAgainstUser[index] == false) {
                        ballot[index] = true;
                      } else {
                        ballot[index] = false;
                      }
                    }
                  }
                  post.pageCount = post.pageCount ? post.pageCount + 1 : 1;
                  post.markModified('pageCount');
                  post.ratings = post.ratings ? post.ratings + 1 : 1;
                  post.markModified('ratings');
                  post.save(function (err, post) {
                    res.render('blog/view', {
                      isCategory: true,
                      post: post,
                      isFavoUser: isFavoUser,
                      metaId: metaId,
                      isSupportUser: isSupportUser,
                      supportId: supportId,
                      isAgainstUser: isAgainstUser,
                      againstId: againstId,
                      ballot: ballot,
                      nextPost: nextPost,
                      prePost: prePost,
                      comments: comments,
                    });
                  });
                });
            });
        });
    });;
});

router.get('/:slug', function (req, res, next) {
  res.redirect('/category/' + req.params.slug + '/1');
});

router.get('/:slug/:page', function (req, res, next) {
  var cateSlug = req.params.slug;
  var user = req.user;

  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  if (isNaN(pNum) || pNum === 0) {
    res.redirect('/category/' + cateSlug + '/1');
    return;
  }
  if (pNum < 0) {
    res.redirect('/category/' + cateSlug + '/' + pageNum);
    return;
  }

  Category.findOne({ slug: cateSlug }).exec(function (err, category) {
    if (err) {
      return next(err);
    }
    var conditions = {category:category,published:true};
    // return res.json(category);
    Post.count(conditions)
    .exec(function (err, count) {
      var pageSize = 6;
      var pageCount = Math.ceil(count / pageSize);
      var skip = (pageNum - 1) * pageSize;
      if (pageCount !== 0 && pageNum > pageCount) {
        pageNum = pageCount;
        res.redirect('/category/' + cateSlug + '/' + pageNum);
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
          
          // var pageSize = 6;
          // var pageCount = Math.ceil(posts.length / pageSize);
          // var skip = (pageNum - 1) * pageSize;
          // if (pageCount !== 0 && pageNum > pageCount) {
          //   pageNum = pageCount;
          // }
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
          res.render('blog/category', {
            // posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
            posts: posts,
            isFavoUser: isFavoUser,
            metaIds: metaIds,
            pageNum: pageNum,
            pageCount: pageCount,
            category: category,
          });
        });
    });
  });
})
