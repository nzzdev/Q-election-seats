const Hapi = require("@hapi/hapi");

module.exports = new Hapi.Server({
  port: process.env.PORT || 3000
});
