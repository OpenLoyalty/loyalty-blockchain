/* eslint-disable no-undef */
const httpStatus = require('http-status');
const { assets } = require('loyalty-blockchain-common');
const prisma = require('../prisma/client');
const logger = require('../config/logger');
const { assetUtils, appUtils } = require('./utils');
const ApiError = require('../utils/ApiError');

const utf8Decoder = new TextDecoder();

/**
 * Get card balance
 * @param {User} userObj
 * @param {String} cardId
 * @param {BigInteger} verbosity
 * @returns {Object}
 */
// eslint-disable-next-line no-unused-vars
const getBalance = async (userObj, cardId, verbosity) => {
  const lastCardEntry = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.amount, tbl.currency, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from gift_card_cards tbl
    where tbl.asset_id=${cardId} and tbl.owner=${userObj.userUuid};
  `;
  if (!lastCardEntry.length) {
    throw new ApiError(httpStatus.NOT_FOUND, `No card with id: ${cardId} owned by: ${userObj.userUuid} found`);
  }

  logger.info(JSON.stringify(lastCardEntry));
  lastCardEntry[0] = assetUtils.reformatDate(lastCardEntry[0]);
  return {
    balance: lastCardEntry[0].amount,
    currency: lastCardEntry[0].currency,
    enforcementDate: lastCardEntry[0].enforcementDate,
    expirationDate: lastCardEntry[0].expirationDate,
    type: lastCardEntry[0].type,
    state: lastCardEntry[0].state,
  };
};

/**
 * Get cards owned by userObj
 * @param {User} userObj
 * @returns {Array}
 */
const getAssets = async (userObj) => {
  const userCards = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.amount, tbl.currency, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from gift_card_cards tbl
    where tbl.owner=${userObj.userUuid};
  `;

  return assetUtils.reformatDate(userCards);
};

/**
 * Get card tx history
 * @param {User} userObj
 * @param {String} cardId
 * @param {BigInteger} verbosity
 * @returns {Object}
 */
const getHistory = async (userObj, cardId, verbosity) => {
  const result = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.amount, tbl.currency, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from gift_card_txview tbl
    where tbl.asset_id=${cardId}
    order by tbl.createdt;
  `;
  logger.info(`verbosity: ${verbosity} collected response: ${JSON.stringify(result)}`);
  if (verbosity > 1) {
    return result;
  }
  const txes = [];
  let lastState;
  let assetType;
  let assetCurrency;
  for (let i = 0; i < Object.values(result).length; i += 1) {
    const stateBefore = assetUtils.reformatDate(
      i > 0
        ? Object.values(result)[i - 1]
        : {
            amount: '0',
            owner: null,
            expirationDate: 0,
            enforcementDate: 0,
            state: 1,
            type: assets.types.AssetType.GIFT_CARD,
          }
    );
    const state = assetUtils.reformatDate(Object.values(result)[i]);
    if (state.owner === userObj.userUuid || stateBefore.owner === userObj.userUuid) {
      const amountDiff = parseInt(state.amount, 10) - parseInt(stateBefore.amount, 10);
      const { metadata } = state;
      const tx = {
        txid: state.txhash,
        amount: amountDiff === 0 ? null : Math.abs(amountDiff),
        direction: null,
        type: metadata.action,
        timestamp: state.createdt,
      };
      if (metadata.action === 'transfer') {
        tx.direction = stateBefore.owner === userObj.userUuid ? 'outcome' : 'income';
        tx.from = stateBefore.owner;
        tx.to = state.owner;
      } else if (metadata.action === 'spend') {
        tx.direction = amountDiff > 0 ? 'income' : 'outcome';
        tx.from = stateBefore.owner;
        tx.to = null; 
      } else {
        tx.direction = amountDiff > 0 ? 'income' : 'outcome';
        tx.from = stateBefore.owner;
        tx.to = state.owner;
      }
      txes.push(tx);
      lastState = state.state;
      assetType = state.type;
      assetCurrency = state.currency;
    }
  }
  return { state: lastState, type: assetType, currency: assetCurrency, txes };
};

/**
 * Get card by id
 * @param {String} assetId
 * @returns {Object}
 */
const getAsset = async (assetId) => {
  const theAsset = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.amount, tbl.currency, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from gift_card_cards tbl
    where tbl.asset_id=${assetId};
  `;

  try {
    return assetUtils.reformatDate(theAsset[0]);
  } catch (e) {
    return null;
  }
};

/**
 * Check if user owns given asset
 * @param {User} userObj
 * @param {String} cardId
 * @returns {Boolean}
 */
const verifyOwner = async (userObj, cardId) => {
  const theAsset = await this.getAsset(cardId);
  return theAsset.owner === userObj.userUuid;
};

/**
 * Check is asset can be transferred
 * @param {User} userObj
 * @param {String} cardId
 * @returns {Boolean}
 */
const verifyTransferability = async (userObj, cardId) => {
  const theAsset = await this.getAsset(cardId);
  const now = Date.now();
  let err = '';
  err += theAsset.owner !== userObj.userUuid ? `Card ownership mismatch!\n` : '';
  err += now > new Date(theAsset.enforcementDate) ? `Card not enforced yet!\n` : '';
  err += now < new Date(theAsset.expirationDate) ? `Card expired!\n` : '';
  if (err) {
    throw ApiError(httpStatus.BAD_REQUEST, err, `Asset: ${JSON.stringify(theAsset)},owner: ${userObj.userUuid}`);
  }
  return true;
};

/**
 * Transfering given card from one user to another
 * @param {User} userObj
 * @param {String} cardId
 * @param {User} receiverObj
 * @return {Object}
 */
const transferCard = async (userObj, cardId, receiverObj) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    userObj,
    userObj.organization.channels[0].name,
    'gift-card-contract'
  );

  try {
    const result = await chaincodeConnection.submitAsync('Transfer', {
      arguments: [cardId, receiverObj.userUuid],
    });
    logger.info(`transferCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);

    return json;
  } catch (e) {
    logger.info(`transferCard failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Spending provided amount of points in the shop from given card
 * @param {User} userObj
 * @param {String} cardId
 * @param {BigInteger} amount
 * @param {String} currency
 * @return {Object}
 */
// eslint-disable-next-line no-unused-vars
const spendFromCard = async (userObj, cardId, amount, currency) => {
  // TODO: verify that currency passed is matching the card currency

  const chaincodeConnection = await appUtils.getChaincodeConnection(
    userObj,
    userObj.organization.channels[0].name,
    'gift-card-contract'
  );

  try {
    const result = await chaincodeConnection.submitAsync('Spend', {
      arguments: [`${amount}`, cardId],
    });

    logger.info(`spendFromCard result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result = assetUtils.reformatDate(json.result);

    return json;
  } catch (e) {
    logger.info(`spendFromCard failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

module.exports = {
  getBalance,
  getAssets,
  getHistory,
  getAsset,
  verifyOwner,
  verifyTransferability,
  transferCard,
  spendFromCard,
};
