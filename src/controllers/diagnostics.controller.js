const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { getIsInitialized } = require('../init');

const getIsHealthy = catchAsync(async (req, res) => {
  const isInitialized = getIsInitialized();
  logger.info(`getIsHealthy: ${isInitialized}`);
  if (isInitialized) {
    res.sendStatus(httpStatus.OK);
  } else {
    res.sendStatus(httpStatus.SERVICE_UNAVAILABLE);
  }
});

module.exports = {
  getIsHealthy
};
