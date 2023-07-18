const { assets, utils } = require('loyalty-blockchain-common');
const { getISODate } = require('../../utils/formatHelpers');
const logger = require('../../config/logger');

/**
 * Reformats dates in UTXO Objects from int format to String format.
 * @param {Array<Object>} utxoList
 * @return {Array}
 */
const reformatDate = (utxoList) => {
  if (!utxoList.length) {
    try {
      logger.info(`reformatDate from: ${JSON.stringify(utxoList, null, 2)}`);
      // eslint-disable-next-line no-param-reassign
      utxoList.enforcementDate = getISODate(utxoList.enforcementDate);
      // eslint-disable-next-line no-param-reassign
      utxoList.expirationDate = getISODate(utxoList.expirationDate);
      // eslint-disable-next-line no-param-reassign
      utxoList.type = utils.getEnumKey(assets.types.AssetType, utxoList.type);
      // eslint-disable-next-line no-param-reassign
      utxoList.state = utils.getEnumKey(assets.types.AssetState, utxoList.state);
    } catch (err) {
      logger.warn(`reformatDate error: ${err}`);
      // eslint-disable-next-line no-param-reassign
      utxoList = [];
    }
    return utxoList;
  }
  utxoList.forEach((utxo) => {
      logger.info(`reformatDate from: ${JSON.stringify(utxo, null, 2)}`);
    // eslint-disable-next-line no-param-reassign
    utxo.enforcementDate = getISODate(utxo.enforcementDate);
    // eslint-disable-next-line no-param-reassign
    utxo.expirationDate = getISODate(utxo.expirationDate);
    // eslint-disable-next-line no-param-reassign
    utxo.type = utils.getEnumKey(assets.types.AssetType, utxo.type);
    // eslint-disable-next-line no-param-reassign
    utxo.state = utils.getEnumKey(assets.types.AssetState, utxo.state);
  });
  return utxoList;
};

module.exports = {
  reformatDate,
};
