var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  passport = require('passport');
User = mongoose.model('User');

module.exports = function (app) {
  app.use('/user', router);
};

router.get('/password', function (req, res, next) {
  res.render('admin/user/password');
});

router.post('/password', function (req, res, next) {
  var user = req.user;
  var pwd = req.body.password;
  var newPwd = req.body.newpwd;
  User.findOne({ name: user.name, authority: 'admin' }, function (err, admin) {
    if (err) { return done(err); }
    if (!admin) {
      req.flash('error', '用户不存在.');
      return res.redirect('/user/password');
    }
    if (!admin.verifyPassword(pwd)) {
      req.flash('error', '密码不匹配.');
      return res.redirect('/user/password');
    }
    admin.password = admin.encryptPassword(newPwd);
    admin.markModified('password');
    admin.save(function (err) {
      if (err) return next(err);
      req.flash('success', '修改密码成功');
      res.redirect('/user/password');
    });
  });
});
