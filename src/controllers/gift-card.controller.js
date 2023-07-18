const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, giftCardService } = require('../services');
const { validateUserOrgConsistency } = require('./utils/utils');
const logger = require('../config/logger');

const transferCard = catchAsync(async (req, res) => {
  const receiverObj = await userService.getUserByUuid(req.body.receiverWallet);
  validateUserOrgConsistency(req.user, receiverObj);
  logger.info(
    `req user: ${req.user.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const card = await giftCardService.transferCard(req.user, req.body.cardId, receiverObj);
  res.status(httpStatus.OK).send(card);
});

const spendFromCard = catchAsync(async (req, res) => {
  logger.info(
    `req user: ${req.user.userUuid} req body: ${JSON.stringify(req.body, null, 2)}`
  );

  const card = await giftCardService.spendFromCard(
    req.user,
    req.body.cardId,
    req.body.amount,
    req.body.currency
  );
  if (!card) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Failed to spend points');
  }
  res.send(card);
});

const getBalance = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req query: ${JSON.stringify(req.query)}`);
  const balance = await giftCardService.getBalance(req.user, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(balance);
});

const getHistory = catchAsync(async (req, res) => {
  logger.info(`req user: ${req.user.userUuid} req query: ${req.query}`);
  const cardHistory = await giftCardService.getHistory(req.user, req.params.cardId, req.query.verbosity);
  res.status(httpStatus.OK).send(cardHistory);
});

module.exports = {
  transferCard,
  spendFromCard,
  getBalance,
  getHistory,
};

