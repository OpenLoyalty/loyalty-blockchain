const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { appUtils, assetUtils } = require('../utils');
const logger = require('../../config/logger');

const utf8Decoder = new TextDecoder();

/**
 * Adding provided amount of points to user by admin
 * @param {User} adminObj
 * @param {User} receiverObj
 * @param {Object} reqBody
 * @returns {Object}
 */
const addPoints = async (adminObj, receiverObj, reqBody) => {
  logger.info(`adminObj: ${JSON.stringify(adminObj, null, 2)}`);
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'expiring-utxo-contract'
  );
  try {
    logger.info(`admin addPoints submitAsync with ${JSON.stringify(reqBody)}`);
    const result = await chaincodeConnection.submitAsync('Mint', {
      arguments: [
        receiverObj.userUuid,
        `${reqBody.amount}`,
        `${reqBody.enforcementDate.getTime() / 1000}`,
        `${reqBody.expirationDate.getTime() / 1000}`,
      ],
    });
    logger.info(`admin addPoints result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);
    logger.info(`addpoints json: ${JSON.stringify(json, null, 2)}`);
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
 * Transfering provided amount of points from one user to another
 * @param {User} adminObj
 * @param {User} senderObj
 * @param {User} receiverObj
 * @param {BigInteger} amount
 * @return {Object}
 */
const transferPoints = async (adminObj, senderObj, receiverObj, amount) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'expiring-utxo-contract'
  );
  try {
    const result = await chaincodeConnection.submitAsync('AdminSend', {
      arguments: [senderObj.userUuid, `${amount}`, receiverObj.userUuid],
    });
    logger.info(`result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result.inputs = assetUtils.reformatDate(json.result.inputs);
    json.result.outputs = assetUtils.reformatDate(json.result.outputs);

    return json;
  } catch (e) {
    logger.info(`admin transferPoints failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Spending provided amount of points in the shop on behalf of user
 * @param {User} adminObj
 * @param {User} senderObj
 * @param {BigInteger} amount
 * @return {Object}
 */
const spendPoints = async (adminObj, senderObj, amount) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    adminObj,
    adminObj.organization.channels[0].name,
    'expiring-utxo-contract'
  );
  try {
    const result = await chaincodeConnection.submitAsync('AdminSpend', {
      arguments: [senderObj.userUuid, `${amount}`],
    });

    logger.info(`admin spendPoints result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result.inputs = assetUtils.reformatDate(json.result.inputs);
    json.result.outputs = assetUtils.reformatDate(json.result.outputs);

    return json;
  } catch (e) {
    logger.info(`admin spendPoints failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

module.exports = {
  transferPoints,
  spendPoints,
  addPoints,
};
