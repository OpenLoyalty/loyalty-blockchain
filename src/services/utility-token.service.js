const httpStatus = require('http-status');
const { assets } = require('loyalty-blockchain-common');
const prisma = require('../prisma/client');
const logger = require('../config/logger');
const { reformatDate } = require('./utils/AssetUtil');
const ApiError = require('../utils/ApiError');

const getStatus = async (userObj, cardId) => {
  const lastCardEntry = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.utilities, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from utility_token_cards tbl
    where tbl.asset_id=${cardId} and tbl.owner=${userObj.userUuid};
  `;
  if (!lastCardEntry.length) {
    throw new ApiError(httpStatus.NOT_FOUND, `No card with id: ${cardId} owned by: ${userObj.userUuid} found`);
  }

  logger.info(JSON.stringify(lastCardEntry));
  lastCardEntry[0] = reformatDate(lastCardEntry[0]);
  return {
    utilities: lastCardEntry[0].utilities,
    enforcementDate: lastCardEntry[0].enforcementDate,
    expirationDate: lastCardEntry[0].expirationDate,
    type: lastCardEntry[0].type,
    state: lastCardEntry[0].state,
  };
};

const getAssets = async (userObj) => {
  const userCards = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.utilities, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from utility_token_cards tbl
    where tbl.owner=${userObj.userUuid};
  `;
  logger.info(`getAssets utility token user: ${userObj.userUuid} ${JSON.stringify(userCards, null, 2)}`);
  return reformatDate(userCards);
};

const getHistory = async (userObj, cardId, verbosity) => {
  const result = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.utilities, tbl.remainingUses, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from utility_token_txview tbl
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
  let assetUtilities;
  for (let i = 0; i < Object.values(result).length; i += 1) {
    const stateBefore = reformatDate(
      i > 0
        ? Object.values(result)[i - 1]
        : {
            utilities: {},
            remainingUses: 0,
            owner: null,
            expirationDate: 0,
            enforcementDate: 0,
            state: 1,
            type: assets.types.AssetType.UTILITY_TOKEN,
          }
    );
    const state = reformatDate(Object.values(result)[i]);
    if (state.owner === userObj.userUuid || stateBefore.owner === userObj.userUuid) {
      const remainingUsesDiff = parseInt(state.remainingUses, 10) - parseInt(stateBefore.remainingUses, 10);
      const { metadata } = state;
      const tx = {
        txid: state.txhash,
        remainingUses: remainingUsesDiff === 0 ? null : Math.abs(remainingUsesDiff),
        direction: null,
        type: metadata.action,
        timestamp: state.createdt,
      };
      if (metadata.action === 'transfer') {
        tx.direction = stateBefore.owner === userObj.userUuid ? 'outcome' : 'income';
        tx.from = stateBefore.owner;
        tx.to = state.owner;
      } else {
        tx.direction = remainingUsesDiff > 0 ? 'income' : 'outcome';
        tx.from = stateBefore.owner;
        tx.to = state.owner;
      }
      txes.push(tx);
      lastState = state.state;
      assetType = state.type;
      assetUtilities = state.utilities;
    }
  }
  return { state: lastState, type: assetType, utilities: assetUtilities, txes };
};

const getAsset = async (assetId) => {
  const theAsset = await prisma.$queryRaw`
    select tbl.asset_id, tbl.txhash, tbl.createdt, tbl.isdelete, tbl.utilities, tbl."expirationDate", tbl."enforcementDate", tbl.state, tbl.type, tbl.owner, tbl.metadata::jsonb
    from utility_token_cards tbl
    where tbl.asset_id=${assetId};
  `;

  try {
    return reformatDate(theAsset[0]);
  } catch (e) {
    return null;
  }
};

const verifyOwner = async (userObj, cardId) => {
  const theAsset = await this.getAsset(cardId);
  return theAsset.owner === userObj.userUuid;
};

const verifyTransferability = async (userObj, cardId) => {
  const theAsset = await this.getAsset(cardId);
  const now = Date.now();
  let err = '';
  err += theAsset.owner !== userObj.userUuid ? `Card ownership mismatch!\n` : '';
  err += now > new Date(theAsset.enforcementDate) ? `Card not enforced yet!\n` : '';
  err += now < new Date(theAsset.expirationDate) ? `Card expired!\n` : '';
  err += theAsset.remainingUses <= 0 ? `No card uses remaining!\n` : '';
  if (err) {
    throw ApiError(httpStatus.BAD_REQUEST, err, `Asset: ${JSON.stringify(theAsset)},owner: ${userObj.userUuid}`);
  }
  return true;
};

module.exports = {
  getStatus,
  getAssets,
  getHistory,
  getAsset,
  verifyOwner,
  verifyTransferability,
};
