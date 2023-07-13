const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'OpenPay API documentation',
    version,
    license: {
      name: 'Apache-2.0',
      url: 'https://github.com/OpenLoyalty/loyalty-blockchain',
    },
  },
  servers: [
    {
      url: `http://127.0.0.1:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
