'use strict';

const Hoek = require('hoek');
const expect = require('chai').expect;
const server = require('../server.js');
const plugins = require('../server-plugins.js');
const routes = require('../routes/routes.js');
const Joi = require('joi');
const Enjoi = require('enjoi');
const fs = require('fs');

const resourcesDir = __dirname + '/../resources/';

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
	encoding: 'utf-8'
}));
const schema = Enjoi(schemaString); 

server.register(plugins, err => {
  Hoek.assert(!err, err);

  server.route(routes);

  server.start(err => {
    Hoek.assert(!err, err);
  })

});

describe('Q required API', () => {

  it('should return 200 for /schema.json', function(done) {
    server.inject('/schema.json', (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  })

  it('should return 200 for /stylesheet/default', function(done) {
    server.inject('/stylesheet/default', (res) => {
      expect(res.statusCode).to.be.equal(200);
      done()
    });
  })

  it('should return 404 for inexistent stylesheet', function(done) {
    server.inject('/stylesheet/inexisting', (res) => {
      expect(res.statusCode).to.be.equal(404);
      done()
    });
  })

});

const mockDataV1 = JSON.parse(JSON.stringify(require('./resources/mock-data-v1.0.0')));
const mockDataV2 = JSON.parse(JSON.stringify(require('./resources/mock-data-v2.0.0')));

describe('rendering-info endpoints', () => {

  it('should return 200 for /rendering-info/html-static', function(done) {
    const request = {
      method: 'POST',
      url: '/rendering-info/html-static',
      payload: JSON.stringify({ item: mockDataV2 })
    };
    server.inject(request, (res) => {
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  })

});

describe('migration endpoint', () => {
  
  it('should pass validation against schema after migration via endpoint /migration', function(done) {
    const request = {
      method: 'POST',
      url: '/migration',
      payload: JSON.stringify({ item: mockDataV1 })
    } ;
    server.inject(request, (res) => {
      expect(Joi.validate(res.result.item, schema).error).to.be.null;
      done();
    })
  })

  it('should return 304 for /migration', function(done) {
    const request = {
      method: 'POST',
      url: '/migration',
      payload: JSON.stringify({ item: mockDataV2 })
    } ;
    server.inject(request, (res) => {
      expect(res.statusCode).to.be.equal(304);
      done();
    })
  })

})
