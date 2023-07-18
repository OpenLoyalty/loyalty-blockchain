/* eslint-disable no-undef */
const httpStatus = require('http-status');
const { assets } = require('loyalty-blockchain-common');
const prisma = require('../prisma/client');
const logger = require('../config/logger');
const { reformatDate } = require('./utils/AssetUtil');
const ApiError = require('../utils/ApiError');

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
    from prepaid_card_cards tbl
    where tbl.asset_id=${cardId} and tbl.owner=${userObj.userUuid};
  `;
  if (!lastCardEntry.length) {
    throw new ApiError(httpStatus.NOT_FOUND, `No card with id: ${cardId} owned by: ${userObj.userUuid} found`);
  }

  logger.info(JSON.stringify(lastCardEntry));
  lastCardEntry[0] = reformatDate(lastCardEntry[0]);
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
    from prepaid_card_cards tbl
    where tbl.owner=${userObj.userUuid};
  `;
  logger.info(`getAssets prepaid card user: ${userObj.userUuid} ${JSON.stringify(userCards, null, 2)}`);
  return reformatDate(userCards);
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
    from prepaid_card_txview tbl
    where asset_id=${cardId}
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
    const stateBefore = reformatDate(
      i > 0
        ? Object.values(result)[i - 1]
        : {
            amount: '0',
            owner: null,
            expirationDate: 0,
            enforcementDate: 0,
            state: 1,
            type: assets.types.AssetType.PREPAID_CARD,
          }
    );
    const state = reformatDate(Object.values(result)[i]);
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
    from prepaid_card_cards tbl
    where tbl.asset_id=${assetId};
  `;

  try {
    return reformatDate(theAsset[0]);
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

module.exports = {
  getBalance,
  getAssets,
  getHistory,
  getAsset,
  verifyOwner,
  verifyTransferability,
};
