

var loremipsum = require('lorem-ipsum'),
  slug = require('slug'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

  mongoose.connect(config.db, { useMongoClient: true });
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Category = mongoose.model('Category');

User.find({'authority':'user'}).exec(function (err, users) {
  if (err || users.length==0) {
    return console.log('cannot find users');
  }
  Category.find(function (err, categories) {
    if (err || !categories) {
      return console.log('cannot find categories');
    }
    users.forEach(function (user) {
      categories.forEach(function (category) {
        for (var i = 0; i < 35; i++) {
          var title = loremipsum({ count: 1, units: 'sentence' });
          var post = new Post({
            title: title,
            slug: slug(title),
            content: loremipsum({ count: 30, units: 'sentence' }),
            category: category,
            author: user,
            favorite: [],
            published: true,
            meta: { favorite: 0 },
            comments: [],
            created: new Date,
            publishtime: new Date,
            pageCount: 0,
            ratings: 0,
          });
  
          post.save(function (err, post) {
            return console.log('saved post:', post.slug);
          });
        }
      });
    });
  });
});