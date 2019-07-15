const fs = require("fs");
const Enjoi = require("enjoi");
const Joi = require("@hapi/joi");
const _ = require("lodash");
const resourcesDir = __dirname + "/../../resources/";
const viewsDir = __dirname + "/../../views/";

const styleHashMap = require(__dirname + `/../../styles/hashMap.json`);

const schemaString = JSON.parse(
  fs.readFileSync(resourcesDir + "schema.json", {
    encoding: "utf-8"
  })
);
const schema = Enjoi.schema(schemaString);

// setup svelte
require("svelte/register");
const staticTemplate = require(viewsDir + "HtmlStatic.svelte").default;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var d3 = require("d3");

function getMarkupWithSeatSvg(parties, markup, width) {
  return new Promise((resolve, reject) => {
    try {
      const dom = new JSDOM(markup);
      let height = width / 2;
      let radius = width / 2;
      let svgContainerElement = dom.window.document.getElementById(
        "q-election-seats-svg-container"
      );
      if (svgContainerElement) {
        let svg = d3
          .select(svgContainerElement)
          .append("svg")
          .attr("viewbox", "0 0 " + width + " " + height)
          .attr("class", "q-election-seats-svg-content")
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height + ")");

        let arc = d3
          .arc()
          .innerRadius(radius / 3)
          .outerRadius(radius);

        let pie = d3
          .pie()
          .value(party => {
            return party.seats;
          })
          .sort(null)
          .startAngle(-90 * (Math.PI / 180))
          .endAngle(90 * (Math.PI / 180));

        let path = svg
          .selectAll("path")
          .data(pie(parties))
          .enter()
          .append("path")
          .attr("class", parties => {
            if (parties.data.color && parties.data.color.classAttribute) {
              return parties.data.color.classAttribute;
            } else {
              return "";
            }
          })
          .attr("d", arc)
          .attr("stroke", "#f5f5f5")
          .attr("fill", parties => {
            let color = parties.data.color;
            if (color && !color.classAttribute) {
              return color.colorCode;
            } else {
              return "currentColor";
            }
          });
      }
      resolve(dom.window.document.body.innerHTML);
    } catch (ex) {
      reject(ex);
    }
  });
}

module.exports = {
  method: "POST",
  path: "/rendering-info/html-static",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: {
        item: schema,
        tooRuntimeConfig: Joi.object()
      }
    },
    cache: false, // do not send cache control header to let it be added by Q Server
    cors: true
  },
  handler: async function(request, h) {
    let item = request.payload.item;

    // gray levels are limited to these specific ones because others are either used or too light
    const defaultGrayLevels = [3, 5, 6, 7, 8, 9];

    // if party has no color we assign a gray level as default
    item.parties.map((party, index) => {
      if (
        !party.color ||
        (!party.color.classAttribute && !party.color.colorCode)
      ) {
        party.color = {
          classAttribute: `s-color-gray-${
            defaultGrayLevels[index % defaultGrayLevels.length]
          }`
        };
      }
      return party;
    });

    // rendering data will be used by template to create the markup
    // it contains the item itself and additional options impacting the markup
    let renderingData = {
      item: item,
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {}
    };

    if (request.query.updatedDate) {
      renderingData.item.updatedDate = request.query.updatedDate;
    }

    if (request.payload.toolRuntimeConfig) {
      renderingData.toolRuntimeConfig = request.payload.toolRuntimeConfig;
    }

    let svelteMarkup = staticTemplate.render(renderingData).html;

    let data = {
      stylesheets: [
        {
          name: styleHashMap.default
        }
      ],
      sophieModules: [],
      markup: svelteMarkup
    };

    let isSophieVizColorDefined = false;
    let parties = renderingData.item.parties;
    if (parties !== undefined) {
      parties.forEach(party => {
        let vizPattern = /^s-viz-color-party.*/;
        if (
          _.has(party, "color.classAttribute") &&
          vizPattern.test(party.color.classAttribute)
        ) {
          isSophieVizColorDefined = true;
        }
      });
    }

    if (isSophieVizColorDefined) {
      data.sophieModules.push({
        name: "sophie-viz-color@1",
        submodules: ["parties"]
      });
    }

    let width = 540;
    try {
      const markupWithSvg = await getMarkupWithSeatSvg(
        item.parties,
        svelteMarkup,
        width
      );
      data.markup = markupWithSvg;
      return data;
    } catch (errorMessage) {
      // return markup without svg in case of errors
      console.log(errorMessage);
      return data;
    }
  }
};
