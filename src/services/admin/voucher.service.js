const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { appUtils, assetUtils } = require('../utils');
const logger = require('../../config/logger');

const utf8Decoder = new TextDecoder();

/**
 * Create new card charged with provided amount of points to user by admin
 * @param {User} adminObj
 * @param {User} receiverObj
 * @param {BigInteger} amount
 * @param {String} currency
 * @param {Date} enforcementDate
 * @param {Date} expirationDate
 * @param {Object} reqBody
 * @returns {Object}
 */
const createCard = async (adminObj, receiverObj, amount, currency, expirationDate, enforcementDate) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'voucher-contract'
  );
  try {
    logger.info(
      `admin createCard submitAsync for ${receiverObj.userUuid} amount: ${amount} expired at: ${expirationDate}, enforced at: ${enforcementDate}`
    );
    const result = await chaincodeConnection.submitAsync('Mint', {
      arguments: [
        receiverObj.userUuid,
        `${amount}`,
        `${currency}`,
        `${enforcementDate.getTime() / 1000}`,
        `${expirationDate.getTime() / 1000}`,
      ],
    });
    logger.info(`admin createCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);
    return json;
  } catch (e) {
    logger.info(`failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Transfering given card from one user to another
 * @param {User} adminObj
 * @param {User} senderObj
 * @param {String} cardId
 * @param {User} receiverObj
 * @return {Object}
 */
const transferCard = async (adminObj, senderObj, cardId, receiverObj) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'voucher-contract'
  );

  try {
    const result = await chaincodeConnection.submitAsync('AdminTransfer', {
      arguments: [senderObj.userUuid, cardId, receiverObj.userUuid],
    });
    logger.info(`admin transferCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);

    return json;
  } catch (e) {
    logger.info(`admin transferCard failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Spending provided amount of points in the shop from given card on behalf of user
 * @param {User} adminObj
 * @param {User} senderObj
 * @param {String} cardId
 * @param {BigInteger} amount
 * @param {String} currency
 * @return {Object}
 */
// eslint-disable-next-line no-unused-vars
const spendFromCard = async (adminObj, senderObj, cardId, amount, currency) => {
  // TODO: verify that currency passed is matching the card currency

  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'voucher-contract'
  );

  try {
    const result = await chaincodeConnection.submitAsync('AdminSpend', {
      arguments: [senderObj.userUuid, cardId, `${amount}`],
    });

    logger.info(`admin spendFromCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);

    return json;
  } catch (e) {
    logger.info(`admin spendFromCard failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

module.exports = {
  createCard,
  transferCard,
  spendFromCard,
};
