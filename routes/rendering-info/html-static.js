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
        let svgContainerElement = window.document.getElementsByClassName('q-election-seat-svg-container');
        
        if (svgContainerElement && svgContainerElement.length === 1) {
          svgContainerElement = svgContainerElement[0];

          let svg = d3.select(svgContainerElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate('+ (width / 2) + ',' + height +')');
          
          let arc = d3.arc()
            //check if this is good  
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
            .attr('class', (data, index) => {
              if (data.data.color && data.data.color.classAttribute) {
                return data.data.color.classAttribute;
              } else {
                return '';
              }
            })
            .attr('d', arc)
            .attr('stroke', '#f5f5f5')
            .attr('fill', (data, index) => {
              if (data.data.color && data.data.color.classAttribute === undefined) {
                return data.data.color.colorCode;
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
	path: '/rendering-info/html-static/{width}',
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
    if (request.query.updatedDate) {
      request.payload.item.updatedDate = request.query.updatedDate;
    }

    let isSophieVizColorDefined = false;
    let parties = request.payload.item.parties;
    if (parties !== undefined) {
      parties.forEach(party => {
        let vizPattern = /^s-viz-color-party.*/;
        if (_.has(party, 'color.classAttribute') && vizPattern.test(party.color.classAttribute)) {
          isSophieVizColorDefined = true;
        }
      })
    }

    let svelteMarkup = staticTemplate.render(request.payload.item);

    let data = {
      stylesheets: [
        {
          name: 'default',
          type: 'critical'
        }
      ],
      markup: svelteMarkup
    }

    if (isSophieVizColorDefined) {
      data.stylesheets.push({
        url: 'https://service.sophie.nzz.ch/bundle/sophie-viz-color@^1.0.0[parties].css',
        type: 'critical'
      });
    }

    return getMarkupWithSeatSvg(request.payload.item.parties, svelteMarkup, request.params.width)
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
