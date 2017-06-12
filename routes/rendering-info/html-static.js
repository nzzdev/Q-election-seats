const fs = require('fs');
const Enjoi = require('enjoi');
const Joi = require('joi');
const _ = require('lodash');
const resourcesDir = __dirname + '/../../resources/';
const viewsDir = __dirname + '/../../views/';

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
	encoding: 'utf-8'
}));
const schema = Enjoi(schemaString);

const displayOptionsSchema = Enjoi(JSON.parse(fs.readFileSync(resourcesDir + 'display-options-schema.json', {
  encoding: 'utf-8'
})));

require('svelte/ssr/register');
const staticTemplate = require(viewsDir + 'html-static.html');

var jsdom = require('jsdom');
var d3 = require('d3');

function getMarkupWithSeatSvg(parties, markup, width) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      html: markup,
      features: {
        QuerySelector: true // query selector is needed for d3 to work
      },
      done: (errors, window) => {
        if (errors) {
          reject(errors);
          return;
        }
        let height = width / 2;
        let radius = width / 2;
        let svgContainerElement = window.document.getElementById('q-election-seats-svg-container');

        if (svgContainerElement) {
          let svg = d3.select(svgContainerElement)
            .append('svg')
            .attr('viewbox', '0 0 ' + width + ' ' + height)
            .attr('class', 'q-election-seats-svg-content')
            .append('g')
            .attr('transform', 'translate('+ (width / 2) + ',' + height +')');
          
          let arc = d3.arc()
            .innerRadius(radius / 3)
            .outerRadius(radius);

          let pie = d3.pie()
            .value((party) => {
              return party.seats;
            })
            .sort(null)
            .startAngle(-90 * (Math.PI/180))
            .endAngle(90 * (Math.PI/180));

          let path = svg.selectAll('path')
            .data(pie(parties))
            .enter()
            .append('path')
            .attr('class', (parties) => {
              if (parties.data.color && parties.data.color.classAttribute) {
                return parties.data.color.classAttribute;
              } else {
                return '';
              }
            })
            .attr('d', arc)
            .attr('stroke', '#f5f5f5')
            .attr('fill', (parties) => {
              let color = parties.data.color;
              if (color && !color.classAttribute) {
                return color.colorCode;
              } else {
                return 'currentColor';
              }
            });
        }
        resolve(window.document.body.innerHTML);
      }
    })
  })
}

module.exports = {
	method: 'POST',
	path: '/rendering-info/html-static',
	config: {
		validate: {
      options: {
        allowUnknown: true
      },
			payload: {
				item: schema,
        tooRuntimeConfig: Joi.object()
			}
		},
    cors: true
	},
	handler: function(request, reply) {
    let item = request.payload.item;

    // gray levels are limited to these specific ones because others are either used or too light
    const defaultGrayLevels = [3, 5, 6, 7, 8, 9];

    // if party has no color we assign a gray level as default
    item.parties.map((party, index) => {
      if (!party.color || (!party.color.classAttribute && !party.color.colorCode)) {
        party.color = {
          classAttribute: `s-color-gray-${defaultGrayLevels[index % defaultGrayLevels.length]}`
        }
      }
      return party;
    })

    // rendering data will be used by template to create the markup
    // it contains the item itself and additional options impacting the markup
    let renderingData = {
      item: item
    }

    if (request.query.updatedDate) {
      renderingData.item.updatedDate = request.query.updatedDate;
    }

    if (request.payload.toolRuntimeConfig) {
      renderingData.toolRuntimeConfig = request.payload.toolRuntimeConfig;
    }

    let svelteMarkup = staticTemplate.render(renderingData);

    let data = {
      stylesheets: [
        {
          name: 'default'
        }
      ],
      markup: svelteMarkup
    }

    let isSophieVizColorDefined = false;
    let parties = renderingData.item.parties;
    if (parties !== undefined) {
      parties.forEach(party => {
        let vizPattern = /^s-viz-color-party.*/;
        if (_.has(party, 'color.classAttribute') && vizPattern.test(party.color.classAttribute)) {
          isSophieVizColorDefined = true;
        }
      })
    }


    if (isSophieVizColorDefined) {
      data.stylesheets.push({
        url: 'https://service.sophie.nzz.ch/bundle/sophie-viz-color@^1.0.0[parties].css'
      });
    }

    let width = 540;
    return getMarkupWithSeatSvg(item.parties, svelteMarkup, width)
      .then(result => {
        data.markup = result;
        return reply(data);
      })
      .catch(errorMessage => {
        // return markup without svg in case of errors
        console.log(errorMessage);
        return reply(data);
      })
	}
}
