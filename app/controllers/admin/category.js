var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  slug = require('slug'),
  pinyin = require("node-pinyin"),
  Category = mongoose.model('Category'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/admin/categories', router);
};

router.get('/', function (req, res, next) {
  res.render('admin/category/index', {
    pretty: true,
  });
});

router.get('/add', function (req, res, next) {
  res.render('admin/category/add', {
    action: '/admin/categories/add',
    category: {},
    pretty: true,
  });
});

router.post('/add', function (req, res, next) {
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

router.get('/edit/:id', getCateforyById, function (req, res, next) {
  res.render('admin/category/add', {
    action: "/admin/categories/edit/" + req.category._id,
    category: req.category,
  });
});

router.post('/edit/:id', getCateforyById, function (req, res, next) {
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

router.get('/delete/:id', function (req, res, next) {
  if (!req.params.id) {
    return next(new Error('no category id provided'));
  }
  Post.find({category: req.params.id})
    .exec(function (err, posts) {
      if (err) return next(err);
      if (posts.length > 0) {
        req.flash('error', '该分类下存在文章，暂不能删除');
        res.redirect('/admin/categories/');
      } else {
        Category.deleteOne({ _id: req.params.id })
        .exec(function (err, rowsRemoved) {
          if (err) return next(err);
          if (rowsRemoved) {
            req.flash('success', '删除成功');
          } else {
            req.flash('failure', '删除失败');
          }
          res.redirect('/admin/categories/');
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