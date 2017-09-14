var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blogone-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blogone-production'
  }
};

module.exports = config[env];
