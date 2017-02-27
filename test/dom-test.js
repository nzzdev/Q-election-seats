const JsDom = require('jsdom');
const expect = require('chai').expect;

const mockData = require('./resources/mock-data');
require('svelte/ssr/register');
const staticTpl = require('../views/html-static.html');
var markup = staticTpl.render(JSON.parse(JSON.stringify(mockData)));


function element(selector) {
  return new Promise((resolve, reject) => {
    JsDom.env(
      markup,
      (err, window) => {
        resolve(window.document.querySelector(selector));
      })
  })
}

function elementCount(selector) {
  return new Promise((resolve, reject) => {
    JsDom.env(
      markup,
      (err, window) => {
        resolve(window.document.querySelectorAll(selector).length);
      })
  })
}

describe('Q election votes dom tests', function() {
  it('should pass if total seat number is found', function() {
    return elementCount('div.q-election-seat-total').then(value => {
        expect(value).to.be.equal(1);
    })
  })

  it('should pass if for each data entry a DOM element is created, because total available seats is equal to sum seats', function() {
    return elementCount('div.q-election-seat-party-item').then(value => {
      expect(value).to.be.equal(mockData.parties.length);
    })
  })
})
