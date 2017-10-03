var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

  module.exports.init = function() {
    passport.use(new LocalStrategy(
      function (username, password, done) {
        User.findOne({ name: username }, function(err, user) {
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
