const bcrypt = require('bcryptjs');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const prisma = require('./prisma/client');
const { initialize } = require('./init');

prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'create') {
      // eslint-disable-next-line no-param-reassign
      params.args.data.password = await bcrypt.hash(params.args.data.password, 8);
    }
    if (params.action === 'update' && params.args.data.password) {
      // eslint-disable-next-line no-param-reassign
      params.args.data.password = await bcrypt.hash(params.args.data.password, 8);
    }
  }
  return next(params);
});

(async () => {
  try {
    await initialize();
    const server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info('Server closed');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error) => {
      logger.error(error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();
