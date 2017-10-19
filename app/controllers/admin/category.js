var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  slug = require('slug'),
  pinyin = require("node-pinyin"),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post');
var auth = require('./admin');

module.exports = function (app) {
  app.use('/admin/categories', router);
};

router.get('/', auth.requireLogin, function (req, res, next) {
  var user = req.user;
  res.render('admin/category/index', {
    user: user,
  });
});

router.get('/add', auth.requireLogin, function (req, res, next) {
  res.render('admin/category/add', {
    action: '/admin/categories/add',
    category: {},
    pretty: true,
  });
});

router.post('/add', auth.requireLogin, function (req, res, next) {
  var name = req.body.name.trim();
  var categoryCheck = {
    name: name,
  };
  req.checkBody('name', '分类名称不能为空').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.render('admin/category/add', {
      errors: errors,
      category: categoryCheck,
    })
  }
  var pyName = pinyin(name, {
    style: 'normal',
  });
  var slugName = slug(pyName);
  Category.find({ slug: slugName })
    .exec(function (err, category) {
      if (err) return next(err);
      if (category.length > 0) {
        req.flash('error', '该分类名称已经存在');
        res.render('admin/category/add', {
          errors: errors,
          category: categoryCheck,
        })
      } else {
        var category = new Category({
          name: name,
          slug: slugName,
          author: req.user,
          postNum: 0,
          created: new Date(),
        });
        category.save(function (err, category) {
          if (err) {
            req.flash('error', '类别保存失败');
            res.redirect('/admin/categories/add');
          } else {
            req.flash('info', '类别保存成功');
            res.redirect('/admin/categories');
          }
        });
      }
    });
});

router.get('/edit/:id', auth.requireLogin, getCateforyById, function (req, res, next) {
  res.render('admin/category/add', {
    action: "/admin/categories/edit/" + req.category._id,
    category: req.category,
  });
});

router.post('/edit/:id', auth.requireLogin, getCateforyById, function (req, res, next) {
  var name = req.body.name.trim();
  var categoryCheck = {
    name: name,
  };
  req.checkBody('name', '分类名称不能为空').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.render('admin/category/add', {
      errors: errors,
      category: categoryCheck,
    })
  }
  var pyName = pinyin(name, {
    style: 'normal',
  });
  var slugName = slug(pyName);
  var category = req.category;
  category.name = name;
  category.slug = slugName;
  category.save(function (err, category) {
    if (err) {
      req.flash('error', '类别保存失败');
      res.redirect('/admin/categories/add');
    } else {
      req.flash('info', '类别保存成功');
      res.redirect('/admin/categories');
    }
  });
});

router.post('/delete/:id', auth.requireLogin, function (req, res, next) {
  if (!req.params.id) {
    return res.status(400).send('No category id provided!');
  }
  Post.find({category: req.params.id})
    .exec(function (err, posts) {
      if (err) return res.status(500).send('The server is having problems');
      if (posts.length > 0) {
        return res.status(403).send({});
        // req.flash('error', '该分类下存在文章，暂不能删除');
        // res.redirect('/admin/categories/');
      } else {
        Category.deleteOne({ _id: req.params.id })
        .exec(function (err, rowsRemoved) {
          if (err) return res.status(500).send('The server is having problems');
          if (rowsRemoved) {
            // req.flash('success', '删除成功');
            return res.status(200).send({});
          } else {
            // req.flash('failure', '删除失败');
            return res.status(404).send({});
          }
          // res.redirect('/admin/categories/');
        });
      }
    });
});

function getCateforyById(req, res, next) {
  if (!req.params.id) {
    return next(new Error('no category id provided'));
  }
  Category.findOne({_id: req.params.id})
    .exec(function (err, category) {
      if (err) return next(err);
      if (!category) return next(new Error('category not found', req.params.id));
      req.category = category;
      next();
    });
}