const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { pointsService, userService, adminService } = require('../../services');
const logger = require('../../config/logger');
const { validateUserOrgConsistency } = require('../utils/utils');

const addPoints = catchAsync(async (req, res) => {
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, receiverObj);
  logger.info(
    `req user: ${req.user.username} on behalf of ${receiverObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );
  const points = await adminService.pointsService.addPoints(req.user, receiverObj, req.body);
  logger.info(`points: ${JSON.stringify(points, null, 2)}`);
  if (!points) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to add points');
  }
  res.status(httpStatus.OK).send(points);
});

const transferPoints = catchAsync(async (req, res) => {
  const senderObj = await userService.getUserByUuid(req.body.ownerWallet);
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, senderObj, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${senderObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const points = await adminService.pointsService.transferPoints(req.user, senderObj, receiverObj, req.body.amount);
  res.status(httpStatus.OK).send(points);
});

const spendPoints = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.body.ownerWallet);
  validateUserOrgConsistency(req.user, userObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const points = await adminService.pointsService.spendPoints(req.user, userObj, req.body.amount);
  if (!points) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to spend points');
  }
  res.send(points);
});

const getBalance = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${req.query}`);
  const points = await pointsService.getBalance(userObj, req.query.verbosity);
  res.status(httpStatus.OK).send(points);
});

const getHistory = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${req.query}`);
  const history = await pointsService.getHistory(userObj, req.query.verbosity);
  res.status(httpStatus.OK).send(history);
});

module.exports = {
  addPoints,
  transferPoints,
  spendPoints,
  getBalance,
  getHistory,
};
