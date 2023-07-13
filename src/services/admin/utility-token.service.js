const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { appUtils } = require('../utils');
const logger = require('../../config/logger');

const utf8Decoder = new TextDecoder();

/**
 * Create new utility token card for a user with specified utilities, usage limits, enforcement date, and expiration date
 * @param {User} adminObj
 * @param {User} receiverObj
 * @param {Object} utilities
 * @param {Object} usageLimits
 * @param {Date} enforcementDate
 * @param {Date} expirationDate
 * @returns {Object}
 */
const createCard = async (adminObj, receiverObj, utilities, usageLimits, enforcementDate, expirationDate) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'utility-token-contract'
  );
  try {
    logger.info(`admin createCard submitAsync for ${receiverObj.userUuid} utilities: ${JSON.stringify(utilities)}`);
    const result = await chaincodeConnection.submitAsync('Mint', {
      arguments: [
        receiverObj.userUuid,
        JSON.stringify(utilities),
        JSON.stringify(usageLimits),
        `${enforcementDate.getTime() / 1000}`,
        `${expirationDate.getTime() / 1000}`,
      ],
    });
    logger.info(`admin createCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    return json;
  } catch (e) {
    logger.info(`failed call to submitAsync. error: ${e}`);
    throw new ApiError(httpStatus.BAD_REQUEST, `Failed to submit transaction to blockchain`, `Failed with error ${e}`);
  }
};

/**
 * Transfer utility tokens from one user to another
 * @param {User} adminObj
 * @param {User} senderObj
 * @param {User} receiverObj
 * @param {BigInteger} amount
 * @return {Object}
 */
const transferCard = async (adminObj, senderObj, receiverObj, amount) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'utility-token-contract'
  );

  try {
    const result = await chaincodeConnection.submitAsync('AdminTransfer', {
      arguments: [senderObj.userUuid, receiverObj.userUuid, `${amount}`],
    });
    logger.info(`admin transferCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    return json;
  } catch (e) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Use utility from the specified card (admin function)
 * @param {User} adminObj
 * @param {User} userObj
 * @param {String} cardId
 * @param {String} utility
 * @return {Object}
 */
const useCard = async (adminObj, userObj, cardId, utility) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'utility-token-contract'
  );

  try {
    logger.info(`admin useCard submitAsync cardId: ${cardId} utility: ${utility}`);
    const result = await chaincodeConnection.submitAsync('AdminUse', {
      arguments: [userObj.userUuid, utility, cardId],
    });
    logger.info(`admin useCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    return json;
  } catch (e) {
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
  useCard,
};
