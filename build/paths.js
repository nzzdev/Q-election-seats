var path = require('path');

var appRoot = 'src/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  source_copy: [appRoot + '**/*.html', appRoot + '**/*.svg'],
  style: appRoot + '**/*.scss',
  output: 'dist/',
  doc:'./doc',
  e2eSpecsSrc: 'test/e2e/src/*.js',
  e2eSpecsDist: 'test/e2e/dist/'
};
