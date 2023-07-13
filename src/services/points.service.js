/* eslint-disable no-undef */
const _ = require('lodash');
const prisma = require('../prisma/client');
const logger = require('../config/logger');
const { userService } = require('./index');
const { appUtils, assetUtils } = require('./utils');

/**
 * Transfering provided amount of points from one user to another
 * @param {User} senderObj
 * @param {User} receiverObj
 * @param {BigInteger} amount
 * @return {Object}
 */
const transferPoints = async (senderObj, receiverObj, amount) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    senderObj,
    senderObj.organization.channels[0].name,
    'expiring-utxo-contract'
  );
  try {
    const result = await chaincodeConnection.submitAsync('Send', {
      arguments: [`${amount}`, receiverObj.userUuid],
    });
    logger.info(`transferPoints result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result.inputs = assetUtils.reformatDate(json.result.inputs);
    json.result.outputs = assetUtils.reformatDate(json.result.outputs);

    return json;
  } catch (e) {
    logger.info(`transferPoints failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Spending provided amount of points in the shop
 * @param {User} senderObj
 * @param {BigInteger} amount
 * @return {Object}
 */
const spendPoints = async (senderObj, amount) => {
  const chaincodeConnection = await appUtils.getChaincodeConnection(
    senderObj,
    senderObj.organization.channels[0].name,
    'expiring-utxo-contract'
  );
  try {
    const result = await chaincodeConnection.submitAsync('Spend', {
      arguments: [`${amount}`],
    });

    logger.info(`spendPoints result: ${JSON.stringify(JSON.parse(utf8Decoder.decode(result.getResult())))}`);
    const json = JSON.parse(utf8Decoder.decode(result.getResult()));
    json.result.inputs = assetUtils.reformatDate(json.result.inputs);
    json.result.outputs = assetUtils.reformatDate(json.result.outputs);

    return json;
  } catch (e) {
    logger.info(`spendPoints failed call to submitAsync. error: ${e}`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to submit transaction to blockchain`,
      `Submit blockchain transaction failed with error ${e}`
    );
  }
};

/**
 * Get user balance
 * @param {User} userObj
 * @param {BigInteger} verbosity
 * @returns {Object}
 */
// eslint-disable-next-line no-unused-vars
const getBalance = async (userObj, verbosity) => {
  let userAssets = await prisma.$queryRaw`
    select txview.txhash, txview.asset_id, isdelete, amount, "enforcementDate", "expirationDate"
    from txview
           join assets on txview.asset_id = assets.asset_id
           join "User" as usr on assets.owner=usr."userUuid"
    where usr.username=${userObj.username};
  `;
  const dateNow = Math.floor(Date.now() / 1000);
  const groupedById = _.groupBy(userAssets, 'asset_id');
  const groupByTxHash = _.groupBy(userAssets, 'txhash');

  const existingAssets = _.filter(groupedById, function (val) {
    return val.length === 1;
  }).flat();
  const activeAssets = _.filter(existingAssets, function (val) {
    return parseInt(val.enforcementDate, 10) < dateNow && parseInt(val.expirationDate, 10) > dateNow;
  });
  const activeUnits = _.sumBy(activeAssets, function (val) {
    return parseInt(val.amount, 10);
  });

  const expiredAssets = _.filter(existingAssets, function (val) {
    return parseInt(val.enforcementDate, 10) < dateNow && parseInt(val.expirationDate, 10) < dateNow;
  });
  const expiredUnits = _.sumBy(expiredAssets, function (val) {
    return parseInt(val.amount, 10);
  });

  const pendingAssets = _.filter(existingAssets, function (val) {
    return parseInt(val.enforcementDate, 10) > dateNow;
  });
  const pendingUnits = _.sumBy(pendingAssets, function (val) {
    return parseInt(val.amount, 10);
  });

  const earnedAssets = _.filter(
    _.filter(groupByTxHash, function (val) {
      return val.length === 1;
    }).flat(),
    function (val) {
      return !val.isdelete;
    }
  );

  const earnedUnits = _.sumBy(earnedAssets, function (val) {
    return parseInt(val.amount, 10);
  });

  const assetsInvolvedInSpends = _.filter(groupByTxHash, function (val) {
    return val.length > 1;
  }).flat();

  const spentUnits = _.sumBy(assetsInvolvedInSpends, function (val) {
    return parseInt(val.amount, 10) * (val.isdelete ? 1 : -1);
  });

  logger.info(JSON.stringify(activeUnits));
  userAssets = assetUtils.reformatDate(userAssets);
  return {
    activeUnits,
    earnedUnits,
    expiredUnits,
    pendingUnits,
    spentUnits,
  };
};

/**
 * Get user tx history
 * @param {User} userObj
 * @param {BigInteger} verbosity
 * @returns {Object}
 */
const getHistory = async (userObj, verbosity) => {
  const result = await prisma.$queryRaw`
    select txview.txhash, txview.createdt, txview.isdelete, assets.amount, assets."expirationDate", assets."enforcementDate", assets.owner
    from txview
           join assets on txview.asset_id = assets.asset_id
           join "User" as usr on assets.owner=usr."userUuid"
    where txview.txhash in (Select txview.txhash
                            from txview
                                   join assets on txview.asset_id = assets.asset_id
                                   join "User" as usr on assets.owner=usr."userUuid"
                            where usr."username"=${userObj.username})
    order by txview.isdelete;
  `;
  logger.info(`verbosity: ${verbosity} collected response: ${JSON.stringify(result)}`);
  const groupedTx = _.groupBy(result, (txEntry) => txEntry.txhash);

  if (verbosity > 1) {
    return groupedTx;
  }
  const txes = [];
  for (let i = 0; i < Object.entries(groupedTx).length; i += 1) {
    const [txid, outputs] = Object.entries(groupedTx)[i];

    const groupedOwners = _.groupBy(outputs, (txEntry) => txEntry.owner);
    const tx = {
      txid,
      from: null,
      to: null,
      amount: 0,
      direction: null,
      type: null,
      timestamp: null,
    };

    const ownerAmounts = [];
    for (let j = 0; j < Object.entries(groupedOwners).length; j += 1) {
      const [owner, ownerOutputs] = Object.entries(groupedOwners)[j];

      tx.txid = tx.txid || ownerOutputs[j].txid;
      tx.timestamp = tx.timestamp || ownerOutputs[j].createdt;

      let ownerUserObj;
      if (owner === userObj.userUuid) {
        ownerUserObj = userObj;
      } else {
        // eslint-disable-next-line no-await-in-loop
        ownerUserObj = await userService.getUserByUuid(owner);
      }
      ownerAmounts.push({
        owner: ownerUserObj.username,
        amount: _.sumBy(ownerOutputs, function (o) {
          return parseInt(o.amount, 10) * (o.isdelete ? -1 : 1);
        }),
      });
    }
    const sender = _.find(ownerAmounts, function (o) {
      return o.amount < 0;
    });
    tx.from = sender ? sender.owner : null;
    const receiver = _.find(ownerAmounts, function (o) {
      return o.amount > 0;
    });

    tx.to = receiver ? receiver.owner : null;
    tx.amount = Math.abs(sender ? sender.amount : receiver.amount);
    tx.direction = tx.from === userObj.username ? 'outcome' : 'income';
    if (tx.from && tx.to) {
      tx.type = 'transfer';
    } else if (tx.from) {
      tx.type = 'spend';
    } else if (tx.to) {
      tx.type = 'add';
    } else {
      tx.type = 'undefined';
      logger.warning(`transaction: ${JSON.stringify(tx)} is malformed`);
    }

    txes.push(tx);
  }
  return { txes };
};

module.exports = {
  transferPoints,
  spendPoints,
  getBalance,
  getHistory,
};
