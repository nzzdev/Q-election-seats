module.exports = [
	require('./rendering-info/html-static.js'),
	require('./stylesheet.js'),
  require('./locales.js'),
  require('./migration.js'),
  require('./health.js')
].concat(require('./schema.js'))
