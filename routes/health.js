module.exports = {
  path: '/health',
  method: 'GET',
  config: {
    tags: ['api']
  },
  handler: (request, h) => {
    return 'ok';
  }
}
