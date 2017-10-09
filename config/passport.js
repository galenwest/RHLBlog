var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

  module.exports.init = function() {
    passport.use('admin.login', new LocalStrategy(
      function (username, password, done) {
        User.findOne({ name: username, authority: 'admin' }, function(err, admin) {
          if (err) { return done(err); }
          if (!admin) {
            return done(null, false, { message: '用户不存在.' });
          }
          if (!admin.verifyPassword(password)) {
            return done(null, false, { message: '密码不匹配.' });
          }
          return done(null, admin);
        });
      }
    ));

    passport.use('user.login', new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true  //此处为true，下面函数的参数才能有req
      },
      function (req, email, password, done) {
        req.checkBody('email','您输入的email无效').notEmpty().isEmail();
        User.findOne({ email: email, authority: 'user' }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: '用户不存在.' });
          }
          if (!user.verifyPassword(password)) {
            return done(null, false, { message: '密码不匹配.' });
          }
          return done(null, user);
        });
      }
    ));
    
    passport.serializeUser(function (user, done) {
      done(null, user._id);
    });
    
    passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      })
    });
  }
