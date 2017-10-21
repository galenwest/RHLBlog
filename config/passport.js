var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var request = require('sync-request');

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

    passport.use('user.login', new LocalStrategy(
      function (username, password, done) {
        if (username == 'admin') {
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
        } else {
          User.findOne({ name: username, authority: 'user' }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
              try {
                var pwd = (new Buffer((new Buffer(password)).toString('base64'))).toString('base64');
                // var user = {username: username, password: pwd, nick: username, authority: 'admin'}
                var user = new User();
                user.nick = username;
                user.name = username;
                user.authority = 'user';
                var res = request('POST', 'https://wngfp.unifiedcloud.lenovo.com/v1/tenants/lenovo/apps/A47C99D473424AD5938531F81B6821FF/service/auth/ad/token', {
                  json: { type: 'JS', username:user.name, password:pwd }
                });
                if (res.statusCode == 200) {
                  user.token = JSON.parse(res.getBody('utf8')).token;
                  user.save(function(err,user){
                    if (err) throw err;
                    return done(null, user);
                  });
                } else if (res.statusCode == 401) {
                  return done(null, false, { message: 'ITCODE或密码错误.' });
                } else if (res.statusCode == 400) {
                  return done(null, false, { message: 'ITCODE或密码不能为空.' });
                } else {
                  return done(null, false, { message: '服务器异常，请重试.' });
                }
              } catch (error) {
                return done(null, false, { message: '服务器异常，请重试.' });
              }
            } else {
              try {
                var pwd = (new Buffer((new Buffer(password)).toString('base64'))).toString('base64');
                var res = request('POST', 'https://wngfp.unifiedcloud.lenovo.com/v1/tenants/lenovo/apps/A47C99D473424AD5938531F81B6821FF/service/auth/ad/token', {
                  json: { type: 'JS', username:user.name, password:pwd }
                });
                if (res.statusCode == 200) {
                  user.token = JSON.parse(res.getBody('utf8')).token;
                  user.markModified('token');
                  user.save(function (err, user) {
                    if (err) { return done(err); }
                    return done(null, user);
                  });
                } else if (res.statusCode == 401) {
                  return done(null, false, { message: 'ITCODE或密码错误.' });
                } else if (res.statusCode == 400) {
                  return done(null, false, { message: 'ITCODE或密码不能为空.' });
                } else {
                  return done(null, false, { message: '服务器异常，请重试.' });
                }
              } catch (error) {
                return done(null, false, { message: '服务器异常，请重试.' });
              }
            }
          });
        }
      }
  ));
  // passport.use('user.login', new LocalStrategy({
  //     usernameField:'email',
  //     passwordField:'password',
  //     passReqToCallback:true  //此处为true，下面函数的参数才能有req
  //   },
  //   function (req, email, password, done) {
  //     req.checkBody('email','您输入的email无效').notEmpty().isEmail();
  //     User.findOne({ email: email, authority: 'user' }, function(err, user) {
  //       if (err) { return done(err); }
  //       if (!user) {
  //         return done(null, false, { message: '用户不存在.' });
  //       }
  //       if (!user.verifyPassword(password)) {
  //         return done(null, false, { message: '密码不匹配.' });
  //       }
  //       return done(null, user);
  //     });
  //   }
  // ));
    
    passport.serializeUser(function (user, done) {
      done(null, user._id);
    });
    
    passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      })
    });
  }
