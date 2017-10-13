var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  User = mongoose.model('User'),
  passport = require('passport');

module.exports = function (app) {
  app.use('/', router);
};

module.exports.requireLogin = function (req, res, next) {
  var user = req.user;
  if (user) {
    next();
  } else {
    req.flash('error', '请登录用户后访问')
    res.redirect('/admin/login');
  }
}

router.get('/', function (req, res, next) {
  var user = req.user;
  Post.count({ published: true })
  .exec(function (err, count) {
    var pageSize = 8;
    var pageNum = 1;
    var pageCount = Math.ceil(count / pageSize);
    Post.find({ published: true })
      .sort({ publishtime: -1 })
      .limit(pageSize)
      .skip(0)
      .populate('author')
      .populate('category')
      .exec(function (err, posts) {
        // return res.json(posts);
        if (err) return next(err);
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
          pretty: true,
        });
      });
  });
});

router.get('/about', function (req, res, next) {
  res.render('blog/about', {
    title: 'About Me',
    pretty: true
  });
});

router.get('/contact', function (req, res, next) {
  res.render('blog/contact', {
    title: 'Contact Me',
    pretty: true
  });
});

router.get('/login', function (req, res, next) {
  var user = req.user;
  if (user) {
    res.redirect('/');
  } else {
    var loginurl = req.query.url;
    res.render('blog/login', {
      loginurl: loginurl
    });
  }
});

router.post('/login', passport.authenticate('user.login', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res, next) {
    var url = req.body.url;
    res.redirect(url);
  });

router.get('/register', function (req, res, next) {
  res.render('blog/signup', {
    pretty: true
  });
});

router.post('/register', function (req, res, next) {
  var nick = req.body.nick;
  var email = req.body.email;
  var password = req.body.password;

  req.checkBody('nick','您的昵称不能为空').notEmpty();
  req.checkBody('email','您输入的email无效').notEmpty().isEmail();
  req.checkBody('password',"密码长度至少4位").notEmpty().isLength({min:4});

  var errors = req.validationErrors();
  if (errors) {
    return res.render('blog/signup', {
      errors: errors,
      nick: nick,
      email: email,
      password: password,
    })
  }

  User.findOne({'email':email},function(err,user){
    if (err) return next(err);
    if(user){
      req.flash('error', '此邮箱已经被注册');
      return res.render('blog/signup', {
        errors: errors,
        nick: nick,
        email: email,
        password: password,
      });
    }
    var newUser = new User();
    newUser.nick = nick;
    newUser.email = email;
    newUser.authority = 'user';
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function(err,result){
      if (err) return next(err);
      res.redirect('/login');
    });
  });
});

router.get('/logout', function (req, res, next) {
  var url = req.query.url;
  req.logout();
  res.redirect(url);
});
