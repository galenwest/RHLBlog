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
    db: 'mongodb://naruto:naruto@47.94.92.161:27017/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://naruto:naruto@47.94.92.161:27017/nodeblog'
  },

  production: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://naruto:naruto@47.94.92.161:27017/nodeblog'
  }
};

module.exports = config[env];
