var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: 80,
    db: 'mongodb://10.122.12.243/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: 80,
    db: 'mongodb://10.122.12.243/nodeblog'
  },

  production: {
    root: rootPath,
    app: {
      name: 'blogone'
    },
    port: 80,
    db: 'mongodb://10.122.12.243/nodeblog'
  }
};

module.exports = config[env];
