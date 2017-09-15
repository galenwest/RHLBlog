var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/posts/1');
});

router.get('/about', function (req, res, next) {
  res.render('blog/index', {
    title: 'About Me',
    posts: posts,
    pretty: true
  });
});

router.get('/contact', function (req, res, next) {
  res.render('blog/index', {
    title: 'Contact Me',
    posts: posts,
    pretty: true
  });
});
