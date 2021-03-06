var express = require('express'),
  router = express.Router(),
  passport = require('passport');

module.exports = function (app) {
  app.use('/admin', router);
};

module.exports.requireLogin = function (req, res, next) {
  var user = req.user;
  if (user && user.authority == 'admin') {
    next();
  } else {
    // req.flash('error', '请登录用户后访问')
    res.redirect('/login');
  }
}

router.get('/', function (req, res, next) {
  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  var user = req.user;
  if (user && user.authority == 'admin') {
  // if (user) {
    res.redirect('/admin/posts');
  } else {
    res.render('blog/login');
  }
});

router.post('/login', passport.authenticate('admin.login', {
    failureRedirect: '/admin/login',
    failureFlash: '用户名或密码错误'
  }),
  function (req, res, next) {
    res.redirect('/admin/posts');
  });

router.get('/logout', function (req, res, next) {
  req.logout();
  // res.redirect('/admin/login');
  res.redirect('/login');
});
