const fs = require('fs');
const Enjoi = require('enjoi');
const resourcesDir = __dirname + '/../../resources/';
const viewsDir = __dirname + '/../../views/';

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
	encoding: 'utf-8'
}));
const schema = Enjoi(schemaString);

require('svelte/ssr/register');
const staticTemplate = require(viewsDir + 'html-static.html');

module.exports = {
	method: 'POST',
	path: '/rendering-info/html-static',
	config: {
		validate: {
			payload: {
				item: schema
			}
		}
	},
	handler: function(request, reply) {
		let data = {
			stylesheets: [
				{
					name: 'default',
					type: 'critical'
				}
			],
			markup: staticTemplate.render(request.payload.item)
		}
		return reply(data);
	}
}
