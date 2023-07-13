const Joi = require('joi').extend(require('@joi/date')).extend(require('joi-currency-code'));

const create = {
  body: Joi.object().keys({
    receiverWallet: Joi.string().guid().required(),
    utilities: Joi.object().pattern(/.*/, Joi.any()).required(),
    usageLimits: Joi.number().integer().positive().required(),
    enforcementDate: Joi.date().iso().required(),
    expirationDate: Joi.date().iso().greater('now').required(),
  }),
};

const use = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
    utility: Joi.string().required(),
  }),
};

const transfer = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
    receiverWallet: Joi.string().guid().required(),
  }),
};

const getBalance = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const getHistory = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

module.exports = {
  create,
  use,
  transfer,
  getBalance,
  getHistory,
};
