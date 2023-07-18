const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { userService, adminService, prepaidCardService } = require('../../services');
const logger = require('../../config/logger');
const { validateUserOrgConsistency } = require('../utils/utils');

const createCard = catchAsync(async (req, res) => {
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${receiverObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );
  const newCard = await adminService.prepaidCardService.createCard(
    req.user,
    receiverObj,
    req.body.amount,
    req.body.currency,
    req.body.expirationDate,
    req.body.enforcementDate
  );
  if (!newCard) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create card');
  }
  res.send(newCard);
});

const transferCard = catchAsync(async (req, res) => {
  const senderObj = await userService.getUserByUuid(req.body.ownerWallet);
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, senderObj, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${senderObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const points = await adminService.prepaidCardService.transferCard(req.user, senderObj, req.body.cardId, receiverObj);
  res.status(httpStatus.OK).send(points);
});

const rechargeCard = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`);

  const points = await adminService.prepaidCardService.rechargeCard(
    req.user,
    req.body.amount,
    req.body.currency,
    req.body.extendPeriodDays,
    req.body.cardId
  );
  res.status(httpStatus.OK).send(points);
});

const spendFromCard = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.body.ownerWallet);
  validateUserOrgConsistency(req.user, userObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const points = await adminService.prepaidCardService.spendFromCard(
    req.user,
    userObj,
    req.body.cardId,
    req.body.amount,
    req.body.currency
  );
  if (!points) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to spend points');
  }
  res.send(points);
});

const getBalance = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${JSON.stringify(req.query)}`);
  const balance = await prepaidCardService.getBalance(userObj, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(balance);
});

const getHistory = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${req.query}`);
  const cardHistory = await prepaidCardService.getHistory(userObj, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(cardHistory);
});

module.exports = {
  createCard,
  transferCard,
  rechargeCard,
  spendFromCard,
  getBalance,
  getHistory,
};
