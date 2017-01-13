const fs = require('fs');
const sass = require('node-sass');
const Boom = require('boom');
const path = require('path');

const stylesDir = __dirname + '/../styles/'

module.exports = {
  method: 'GET',
  path: '/stylesheet/{name*}',
  handler: function(request, reply) {
    const filePath = stylesDir + `${request.params.name}.scss`;
    fs.exists(filePath, (exists) => {
      if (!exists) {
        return reply(Boom.notFound())
      }
      sass.render(
        {
          file: filePath,
          outputStyle: 'compressed'
        }, 
        (err, result) => {
          if (err) {
            reply(Boom.badImplementation(err));
          } else {
            reply(result.css)
          }
        }
      )
    });
  }
}
