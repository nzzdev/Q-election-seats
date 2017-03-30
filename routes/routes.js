const htmlStatic = require('./rendering-info/html-static.js');
const stylesheet = require('./stylesheet.js');
const schema = require('./schema.js');
const locales = require('./locales.js');
const migration = require('./migration.js');

module.exports = [
	htmlStatic,
	stylesheet,
	schema,
  locales,
  migration
]
