const Hapi = require('hapi');

module.exports = new Hapi.Server({
  port: process.env.PORT || 3000
});
