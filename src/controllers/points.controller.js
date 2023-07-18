const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, pointsService } = require('../services');
const { validateUserOrgConsistency } = require('./utils/utils');
const logger = require('../config/logger');

const transferPoints = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req body: ${JSON.stringify(req.body)}`);
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet, { organization: true });
  validateUserOrgConsistency(req.user, receiverObj);
  const points = await pointsService.transferPoints(req.user, receiverObj, req.body.amount);
  res.status(httpStatus.OK).send(points);
});

const spendPoints = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`);
  const points = await pointsService.spendPoints(req.user, req.body.amount);
  if (!points) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to spend points');
  }
  res.send(points);
});

const getBalance = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req query: ${req.query}`);
  const points = await pointsService.getBalance(req.user, req.query.verbosity);
  res.status(httpStatus.OK).send(points);
});

const getHistory = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req query: ${req.query}`);
  const history = await pointsService.getHistory(req.user, req.query.verbosity);
  res.status(httpStatus.OK).send(history);
});

module.exports = {
  transferPoints,
  spendPoints,
  getBalance,
  getHistory,
};
