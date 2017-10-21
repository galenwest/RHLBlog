var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  passport = require('passport');
var User = mongoose.model('User');
var Contact = mongoose.model('Contact');
var auth = require('../admin/admin');

module.exports = function (app) {
  app.use('/user', router);
};

router.get('/contact', auth.requireLogin, function (req, res, next) {
  res.redirect('/user/contact/1');
});

router.get('/contact/:page', auth.requireLogin, function (req, res, next) {
  var pNum = parseInt(req.params.page, 10);
  var pageNum = Math.abs(pNum);
  Contact.count()
  .exec(function (err, count) {
    var pageSize = 12;
    var pageCount = Math.ceil(count / pageSize);
    var skip = (pageNum - 1) * pageSize;
    if (pageCount !== 0 && pageNum > pageCount) {
      pageNum = pageCount;
      res.redirect('/user/contact/' + pageNum);
      return;
    }
    Contact.find()
      .limit(pageSize)
      .skip(skip)
      .exec(function (err, contacts) {
        if (err) { return done(err); }
        res.render('admin/user/contact', {
          contacts: contacts,
          pageNum: pageNum,
          pageCount: pageCount,
        });
      });
  });
});
