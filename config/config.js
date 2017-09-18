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
    db: 'mongodb://localhost/nodeblog'
  },

  production: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/nodeblog'
  }
};

module.exports = config[env];
