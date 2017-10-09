var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var moment = require('moment');
var truncate = require('truncate');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var messages = require('express-messages');
var expressValidator = require('express-validator');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

var User = mongoose.model('User');
var Category = mongoose.model('Category');

module.exports = function(app, config, connection) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';
  
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  app.use(function (req, res, next) {
    app.locals.pageName = req.path;
    app.locals.moment = moment;
    app.locals.truncate = mytruncate;
    Category.find().sort('-created')
      .exec(function (err, categories) {
        if (err) {
          return next(err);
        }
        app.locals.categories = categories;
        next();
      })
  });

  app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser('rhlblog'));

  app.use(expressValidator({
    errorFormatter: function(param, msg, value, location) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      }
    }
  }));

  app.use(session({
    secret: 'rhlblog',
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false, maxAge:365*24*3600*1000},
    store: new MongoStore({mongooseConnection: connection})
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function (req, res, next) {
    req.user = null;
    // console.log(req.session.passport);
    if (req.session.passport && req.session.passport.user) {
      User.findById(req.session.passport.user, function (err, user) {
        if (err) return next(err);
        user.password = null;
        req.user = user;
        next();
      })
    } else {
      next();
    }
  });

  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.messages = messages(req, res);
    res.locals.user = req.user;
    next();
  });

  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/**/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
  });

  return app;
};

function mytruncate (str) {
  return truncate(str.replace(/[&\|\\\*~+=`#\-]/g,""), 90);
}
