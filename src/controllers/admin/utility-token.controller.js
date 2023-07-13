const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { userService, adminService, utilityTokenService } = require('../../services');
const logger = require('../../config/logger');
const { validateUserOrgConsistency } = require('../utils/admin/utils');

const createCard = catchAsync(async (req, res) => {
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${receiverObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );
  const newCard = await adminService.utilityTokenService.createCard(
    req.user,
    receiverObj,
    req.body.utilities,
    req.body.usageLimits,
    req.body.enforcementDate,
    req.body.expirationDate
  );
  if (!newCard) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to create card');
  }
  res.send(newCard);
});

const useCard = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.body.ownerWallet);
  validateUserOrgConsistency(req.user, userObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );
  const usageResult = await adminService.utilityTokenService.useCard(req.user, userObj, req.body.cardId, req.body.utility);
  if (!usageResult) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to use utility');
  }
  res.send(usageResult);
});

const transferCard = catchAsync(async (req, res) => {
  const senderObj = await userService.getUserByUuid(req.body.ownerWallet);
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, senderObj, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} on behalf of ${senderObj.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const transferResult = await adminService.utilityTokenService.transferCard(
    req.user,
    senderObj,
    req.body.cardId,
    receiverObj
  );
  res.status(httpStatus.OK).send(transferResult);
});

const getBalance = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${JSON.stringify(req.query)}`);
  const balance = await utilityTokenService.getBalance(userObj, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(balance);
});

const getHistory = catchAsync(async (req, res) => {
  const userObj = await userService.getUserByUuid(req.params.wallet);
  logger.info(`req user: ${req.user.userUuid} on behalf of ${userObj.userUuid} req query: ${req.query}`);
  const cardHistory = await utilityTokenService.getHistory(userObj, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(cardHistory);
});

module.exports = {
  createCard,
  useCard,
  transferCard,
  getBalance,
  getHistory,
};
