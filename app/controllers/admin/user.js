var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  passport = require('passport');
var User = mongoose.model('User');

module.exports = function (app) {
  app.use('/admin', router);
};

router.get('/password', function (req, res, next) {
  res.render('admin/user/password');
});

router.post('/password', function (req, res, next) {
  var user = req.user;
  var pwd = req.body.password;
  var newPwd = req.body.newpwd;
  var rnewPwd = req.body.rnewpwd;
  if (newPwd.length < 6) {
    req.flash('error', '新密码至少六位.');
    return res.redirect('/admin/password');
  }
  if (newPwd !== rnewPwd) {
    req.flash('error', '两次密码不相同，请重新输入.');
    return res.redirect('/admin/password');
  }
  User.findOne({ name: user.name, authority: 'admin' }, function (err, admin) {
    if (err) { return done(err); }
    if (!admin) {
      req.flash('error', '用户不存在.');
      return res.redirect('/admin/password');
    }
    if (!admin.verifyPassword(pwd)) {
      req.flash('error', '密码不匹配.');
      return res.redirect('/admin/password');
    }
    admin.password = admin.encryptPassword(newPwd);
    admin.markModified('password');
    admin.save(function (err) {
      if (err) return next(err);
      req.flash('success', '修改密码成功');
      res.redirect('/admin/password');
    });
  });
});
