const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Loyalty Blockchain API',
    version,
    license: {
      name: 'Apache-2.0',
      url: 'https://github.com/OpenLoyalty/loyalty-blockchain/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
    },
  ],
};

module.exports = swaggerDef;
