const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const routes = require("../routes/routes.js");
let server;

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
    });
    server.route(routes);
  } catch (err) {
    expect(err).to.not.exist();
  }
});

after(async () => {
  await server.stop({ timeout: 2000 });
  server = null;
});

function element(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelector(selector));
  });
}

function elementCount(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

lab.experiment("dom tests", function() {
  it("should pass if total seat number is found", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-static?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/results-color-classes-no-vacancy.json"),
        toolRuntimeConfig: {
          displayOptions: {}
        }
      }
    });

    return elementCount(
      response.result.markup,
      "div.q-election-seats-total"
    ).then(value => {
      expect(value).to.be.equal(1);
    });
  });

  it("should pass if for each data entry a DOM element is created, because total available seats is equal to sum seats", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-static?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/results-color-classes-no-vacancy.json"),
        toolRuntimeConfig: {
          displayOptions: {}
        }
      }
    });

    return elementCount(
      response.result.markup,
      "div.q-election-seats-party-item"
    ).then(value => {
      expect(value).to.be.equal(6);
    });
  });

  it("should display the updated date", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-static?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/show-updated-date.json"),
        toolRuntimeConfig: {
          displayOptions: {}
        }
      }
    });

    return element(response.result.markup, "div.s-q-item__footer").then(
      element => {
        expect(element.innerHTML.includes("Update")).to.be.equals(true);
      }
    );
  });

  it("should note display the updated date", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-static?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hide-updated-date.json"),
        toolRuntimeConfig: {
          displayOptions: {}
        }
      }
    });

    return element(response.result.markup, "div.s-q-item__footer").then(
      element => {
        expect(element.innerHTML.includes("Update")).to.be.equals(false);
      }
    );
  });
});
