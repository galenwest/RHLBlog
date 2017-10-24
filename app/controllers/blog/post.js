var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post'),
  PostMeta = mongoose.model('PostMeta'),
  Support = mongoose.model('Support'),
  Against = mongoose.model('Against'),
  CommentReply = mongoose.model('CommentReply'),
  Comment = mongoose.model('Comment');
var moment = require('moment');

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
        .sort({ publishtime: -1 })
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
      if (!post) return next(err);
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
              Comment.find({post:post, shielded: false})
                .populate('fromUser')
                .sort({ _id: -1 })
                .exec(function (err, comments) {
                  if (err) return next(err);
                  var isFavoUser = false; //当前用户是否点赞该文章
                  var metaId = '';
                  var isSupportUser = []; //该文章下所有评论当前用户是否支持列表，前端用来判断展示用
                  var supportId = [];
                  var isAgainstUser = [];
                  var againstId = [];
                  var ballot = [];
                  //判断用户是否在线
                  if (user) {
                    if (post.favorite && post.favorite !== undefined && post.favorite instanceof Array && post.favorite.length > 0) {
                      biaojiA:
                      for (var indexU = 0; indexU < post.favorite.length; indexU++) {
                        var favoUser = post.favorite[indexU];
                        if (favoUser.fromUser.toString() === user._id.toString()) {
                          isFavoUser = true;
                          metaId = favoUser.metaId;
                          break biaojiA;
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
                    if (err) return next(err);
                    // return res.json(post);
                    res.render('blog/view', {
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

router.post('/comment/:slug', function (req, res, next) {
  if (!req.params.slug) {
    return next(new Error('No post slug provided!'));
  }
  // return res.json(req.params);
  var user = req.user;
  if (!user) {
    req.flash('error', '请登录后发布评论');
    return res.redirect('/posts/view/' + req.params.slug + '#commentAnchorPoint');
  }
  if (!req.body.comment) {
    req.flash('error', '请撰写评论后发布');
    return res.redirect('/posts/view/' + req.params.slug + '#commentAnchorPoint');
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
        meta: { support: 0, against: 0 },
        shielded: false,
        created: new Date(),
      });
      comment.save(function (err, comment) {
        if (err) {
          req.flash('error', '评论发布失败');
          return res.redirect('/posts/view/' + post.slug + '#commentAnchorPoint');
        } else {
          post.ratings = post.ratings ? post.ratings + 30 : 30;
          post.markModified('ratings');
          post.meta.comments = post.meta.comments ? post.meta.comments + 1 : 1;
          post.markModified('meta');
          var comment = comment._id;
          post.comments.unshift(comment);
          post.markModified('comments');
          post.save(function (err, post) {
            if (err) {
              req.flash('error', '评论发布失败');
              return res.redirect('/posts/view/' + post.slug + '#commentAnchorPoint');
            } else {
              req.flash('success', '评论发布成功');
              res.redirect('/posts/view/' + post.slug + '#' + comment);
            }
          });
        }
      });
    });
});

router.post('/comment/reply/:postid/:commentid', function (req, res, next) {
  if (!req.params.postid) {
    return res.status(400).send('No post id provided!');
  }
  if (!req.params.commentid) {
    return res.status(400).send('No comment id provided!');
  }
  var user = req.user;
  if (!user) {
    return res.status(401).send('Please login!');
  }
  if (!req.body.comment) {
    return res.status(404).send('Please write content!');
  }
  Comment.findOne({_id:mongoose.Types.ObjectId(req.params.commentid)})
    .exec(function (err, comment) {
      if (err) return res.status(500).send('The server is having problems');
      var commentReply = new CommentReply({
        post: req.params.postid,
        comment: comment._id,
        content: req.body.comment,
        fromUser: user,
        shielded: false,
        created: new Date(),
      });
      commentReply.save(function (err, reply) {
        if (err) {
          return res.status(500).send('The server is having problems');
        } else {
          var replyid = reply._id;
          comment.reply.unshift(replyid);
          comment.markModified('reply');
          comment.save(function (err, comment) {
            if (err) {
              return res.status(500).send('The server is having problems');
            } else {
              return res.status(200).send({replyid: reply._id, nick: reply.fromUser.nick, created: moment(reply.created).format('YYYY-MM-DD HH:mm')});
            }
          });
        }
      });
    });
});

router.get('/comment/replys/:postid/:commentid', function (req, res, next) {
  if (!req.params.postid) {
    return res.status(400).send('No post id provided!');
  }
  if (!req.params.commentid) {
    return res.status(400).send('No comment id provided!');
  }
  CommentReply.find({post:mongoose.Types.ObjectId(req.params.postid),comment:mongoose.Types.ObjectId(req.params.commentid)})
    .populate('fromUser')
    .exec(function (err, replys) {
      if (err) {
        return res.status(500).send('The server is having problems');
      } else {
        var commentReplys = [];
        replys.forEach(function(reply) {
          commentReplys.push({replyid: reply._id, nick: reply.fromUser.nick, created: moment(reply.created).format('YYYY-MM-DD HH:mm'), content: reply.content});
        }, this);
        // setTimeout(function () {
          return res.status(200).send(commentReplys);
        // }, 5000);
      }
    });
});

router.post('/favorite/:id', function (req, res, next) {
  if (!req.params.id) {
    return res.status(400).send('No post id provided!');
  }

  var user = req.user;
  if (!user) {
    return res.status(401).send('Please login!');
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
      if (err) return res.status(500).send('The server is having problems');

      var meta = new PostMeta({
        post: post,
        favorite: true,
        fromUser: user,
        created: new Date(),
      });
      meta.save(function (err, meta) {
        if (err) {
          return res.status(500).send('The server is having problems');
        } else {
          post.ratings = post.ratings ? post.ratings + 20 : 20;
          post.markModified('ratings');
          var favorite = {fromUser:user._id, metaId: meta._id};
          post.meta.favorite = post.meta.favorite ? post.meta.favorite + 1 : 1;
          post.favorite.unshift(favorite);
          post.markModified('meta');
          post.markModified('favorite');
          post.save(function (err) {
            // setTimeout(function () {
            if (err) return res.status(500).send('The server is having problems');
            else return res.status(200).send({favorCount: post.meta.favorite, metaId: meta._id});
            // }, 5000);
          });
        }
      });
    });
});

router.post('/unfavorite/:id/:metaId', function (req, res, next) {
  if (!req.params.id) {
    return res.status(400).send('No post id provided!');
  }
  if (!req.params.metaId) {
    return res.status(400).send('No meta id provided!');
  }

  var user = req.user;
  if (!user) {
    return res.status(401).send('Please login!');
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
      if (err) return res.status(500).send('The server is having problems');
      PostMeta.findOne({_id: req.params.metaId})
        .exec(function (err, meta) {
          if (err) {
            return res.status(500).send('The server is having problems');
          } else {
            if (post.favorite && post.favorite !== undefined && post.favorite instanceof Array && post.favorite.length > 0) {
              for (var i = 0; i < post.favorite.length; i++) {
                if (post.favorite[i].metaId.toString() == meta._id.toString()) {
                  post.favorite.splice(i,1);
                }
              }
            } else {
              return res.status(200).send({favocount: post.meta.favorite});
            }
            post.ratings = post.ratings ? post.ratings - 20 : 0;
            post.markModified('ratings');
            post.meta.favorite = post.meta.favorite ? post.meta.favorite - 1 : 0;
            post.markModified('meta');
            post.markModified('favorite');
            post.save(function (err) {
              if (err) {
                return res.status(500).send('The server is having problems');
              } else {
                meta.favorite = false;
                meta.cancelTime = new Date();
                meta.markModified('favorite');
                meta.markModified('cancelTime');
                meta.save(function (err) {
                  // setTimeout(function () {
                  if (err) return res.status(500).send('The server is having problems');
                  else return res.status(200).send({favocount: post.meta.favorite});
                  // }, 5000);
                });
              }
            });
          }
        });
    });
});

router.post('/comment/support/:id', function (req, res, next) {

  if (!req.params.id) {
    return res.status(400).send('No comment id provided!');
  }
  var user = req.user;
  if (!user) {
    return res.status(401).send('Please login!');
  }

  Comment.findOne({_id:req.params.id})
    .exec(function (err, comment) {
      if (err) return res.status(500).send('The server is having problems');

      var support = new Support({
        comment: comment._id,
        issupport: true,
        fromUser: user._id,
        created: new Date(),
      });
      support.save(function (err, support) {
        if (err) {
          return res.status(500).send('The server is having problems');
        } else {
          comment.support.unshift({fromUser:user._id, supportId: support._id});
          comment.meta.support = comment.meta.support ? comment.meta.support + 1 : 1;
          comment.markModified('meta');
          comment.markModified('support');
          comment.save(function (err) {
            if (err) return res.status(500).send('The server is having problems');
            else return res.status(200).send({supportCount: comment.meta.support, supportId: support._id});
          });
        }
      });
    });
});

router.post('/comment/unsupport/:id/:supportid', function (req, res, next) {
  if (!req.params.id) {
    return res.status(400).send('No comment id provided!');
  }
  if (!req.params.supportid) {
    return res.status(400).send('No support id provided!');
  }
  var user = req.user;
  if (!user) {
    return res.status(401).send('Please login!');
  }

  Comment.findOne({_id:req.params.id})
    .exec(function (err, comment) {
      if (err) return res.status(500).send('The server is having problems');

      Support.findOne({_id: req.params.supportid})
        .exec(function (err, support) {
          if (err) {
            return res.status(500).send('The server is having problems');
          } else {
            if (comment.support && comment.support !== undefined && comment.support instanceof Array && comment.support.length > 0) {
              for (var i = 0; i < comment.support.length; i++) {
                if (comment.support[i].supportId.toString() == support._id.toString()) {
                  comment.support.splice(i,1);
                }
              }
            } else {
              return res.status(200).send({suppcount: comment.meta.support});
            }
            comment.meta.support = comment.meta.support ? comment.meta.support - 1 : 0;
            comment.markModified('meta');
            comment.markModified('support');
            comment.save(function (err) {
              if (err) {
                return res.status(500).send('The server is having problems');
              } else {
                support.issupport = false;
                support.cancelTime = new Date();
                support.markModified('issupport');
                support.markModified('cancelTime');
                support.save(function (err) {
                  if (err) return res.status(500).send('The server is having problems');
                  else return res.status(200).send({suppcount: comment.meta.support});
                });
              }
            });
          }
        });
    });
});

router.post('/comment/against/:id', function (req, res, next) {
  
    if (!req.params.id) {
      return res.status(400).send('No comment id provided!');
    }
    var user = req.user;
    if (!user) {
      return res.status(401).send('Please login!');
    }
  
    Comment.findOne({_id:req.params.id})
      .exec(function (err, comment) {
        if (err) return res.status(500).send('The server is having problems');
  
        var against = new Against({
          comment: comment._id,
          isagainst: true,
          fromUser: user._id,
          created: new Date(),
        });
        against.save(function (err, against) {
          if (err) {
            return res.status(500).send('The server is having problems');
          } else {
            comment.against.unshift({fromUser:user._id, againstId: against._id});
            comment.meta.against = comment.meta.against ? comment.meta.against + 1 : 1;
            comment.markModified('meta');
            comment.markModified('against');
            comment.save(function (err) {
              if (err) return res.status(500).send('The server is having problems');
              else return res.status(200).send({againstCount: comment.meta.against, againstId: against._id});
            });
          }
        });
      });
  });
  
  router.post('/comment/unagainst/:id/:againstid', function (req, res, next) {
    if (!req.params.id) {
      return res.status(400).send('No comment id provided!');
    }
    if (!req.params.againstid) {
      return res.status(400).send('No against id provided!');
    }
    var user = req.user;
    if (!user) {
      return res.status(401).send('Please login!');
    }
  
    Comment.findOne({_id:req.params.id})
      .exec(function (err, comment) {
        if (err) return res.status(500).send('The server is having problems');
  
        Against.findOne({_id: req.params.againstid})
          .exec(function (err, against) {
            if (err) {
              return res.status(500).send('The server is having problems');
            } else {
              if (comment.against && comment.against !== undefined && comment.against instanceof Array && comment.against.length > 0) {
                for (var i = 0; i < comment.against.length; i++) {
                  if (comment.against[i].againstId.toString() == against._id.toString()) {
                    comment.against.splice(i,1);
                  }
                }
              } else {
                return res.status(200).send({againcount: comment.meta.against});
              }
              comment.meta.against = comment.meta.against ? comment.meta.against - 1 : 0;
              comment.markModified('meta');
              comment.markModified('against');
              comment.save(function (err) {
                if (err) {
                  return res.status(500).send('The server is having problems');
                } else {
                  against.isagainst = false;
                  against.cancelTime = new Date();
                  against.markModified('isagainst');
                  against.markModified('cancelTime');
                  against.save(function (err) {
                    if (err) return res.status(500).send('The server is having problems');
                    else return res.status(200).send({againcount: comment.meta.against});
                  });
                }
              });
            }
          });
      });
  });
  