// /**
//  * Copyright 2018 IBM All Rights Reserved.
//  *
//  * SPDX-License-Identifier: Apache-2.0
//  */
//
// const config = require('config');
// const Client = require('fabric-client');
// const BaseWallet = require('fabric-network/lib/impl/wallet/basewallet');
// const logger = require('../../../config/logger');
//
// const postgresDbHelper = require('./postgres-db-helper');
// logger.setLevel(config.logLevel);
//
// /**
//  * This class defines an implementation of an Identity wallet that persists
//  * to a Postgre DB database
//  *
//  * @class
//  * @extends {BaseWallet}
//  */
// class PostgresDBWallet extends BaseWallet {
//   /**
//    * @inheritdoc
//    */
//   async exists(label) {
//     return new Promise((resolve, reject) => {;
//       postgresDbHelper.getUser(label).then(result => {
//         result.length ? resolve(true) : resolve(false);
//       }).catch(err => {
//         logger.error('exists error ' + err);
//         resolve(false);
//       })
//     });
//
//   };
//
//   /**
//    * @inheritdoc
//    */
//   async export(label) {
//     return new Promise(function (resolve, reject) {
//       const method = 'export';
//       logger.debug('in %s, label = %s', method, label);
//       postgresDbHelper.getUser(label).then((result) => {
//         if (result[0] && result[0].cert) {
//           resolve(JSON.parse(result[0].cert));
//         } else {
//           reject('cert is not available');
//         }
//       }).catch(err => {
//         reject(err);
//       });
//
//     });
//   }
//
//   /**
//    * @inheritdoc
//    */
//   async import (label, role, org, pw, certificate) {
//     return new Promise(function (resolve, reject) {
//       const method = 'import';
//       logger.debug('in %s, label = %s', method, label);
//
//       postgresDbHelper.insertUser(label, role, org, pw, certificate).then(result => {
//           resolve(result);
//       }).catch(err => {
//         reject(err);
//       });
//     });
//   }
//
// }
//
//
//
// module.exports.PostgresDBWallet = PostgresDBWallet;
