var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  User = mongoose.model('User'),
  Contact = mongoose.model('Contact'),
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
  var vmuser = {
    name: req.query.name,
    email: req.query.email,
    content: req.query.content
  }
  res.render('blog/contact', {
    title: 'Contact Me',
    user: req.user,
    vmuser: vmuser,
  });
});

router.post('/contact', function (req, res, next) {
  var vmuser = {
    name: req.body.author,
    email: req.body.email,
    content: req.body.content
  }
  if (!vmuser.name) {
    req.flash('error', '为了解决您的问题，请告诉我们您的名字');
    return res.redirect('/contact?name='+vmuser.name+'&email='+vmuser.email+'&content='+vmuser.content);
  }
  if (!vmuser.email) {
    req.flash('error', '为了解决您的问题，请告诉我们您的邮箱');
    return res.redirect('/contact?name='+vmuser.name+'&email='+vmuser.email+'&content='+vmuser.content);
  }
  if (!vmuser.content) {
    req.flash('error', '为了解决您的问题，请填写您要说的话');
    return res.redirect('/contact?name='+vmuser.name+'&email='+vmuser.email+'&content='+vmuser.content);
  }
  var emailreg = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z]{2,5}$/;
  if (!emailreg.test(vmuser.email)) {
    req.flash('error', '为了解决您的问题，请您输入正确的邮箱');
    return res.redirect('/contact?name='+vmuser.name+'&email='+vmuser.email+'&content='+vmuser.content);
  }

  var contact = new Contact();
  contact.name = vmuser.name;
  contact.email = vmuser.email;
  contact.content = vmuser.content;
  contact.created = new Date();
  contact.save(function (err) {
    if (err) return next(err);
    req.flash('success', '感谢您提供反馈');
    res.redirect('/contact');
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
    var user = req.user;
    if (user.authority == 'admin') {
      res.redirect('/admin');
    } else {
      var url = req.body.url;
      if (url) {
        res.redirect(url);
      } else {
        res.redirect('/');
      }
    }
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
