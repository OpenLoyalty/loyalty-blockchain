const Joi = require('joi').extend(require('@joi/date')).extend(require('joi-currency-code'));

const balance = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const history = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

// TODO: smarter validation of enforcementDate+expirationDate here...
const create = {
  body: Joi.object().keys({
    receiverWallet: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
    currency: Joi.string().currency().required(),
    enforcementDate: Joi.date().iso().required(),
    expirationDate: Joi.date().iso().greater('now').required(),
  }),
};

const spend = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
    amount: Joi.number().integer().positive().required(),
    currency: Joi.string().currency().required(),
  }),
};

const transfer = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    cardId: Joi.string().required(),
    receiverWallet: Joi.string().guid().required(),
  }),
};

const recharge = {
  body: Joi.object().keys({
    cardId: Joi.string().required(),
    amount: Joi.number().integer().positive().required(),
    currency: Joi.string().currency().required(),
    extendPeriodDays: Joi.number().integer().positive().allow(0).required(),
  }),
};

module.exports = {
  balance,
  history,
  create,
  spend,
  transfer,
  recharge,
};
