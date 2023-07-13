const Joi = require('joi').extend(require('@joi/date'));

const balance = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const history = {
  params: Joi.object().keys({
    wallet: Joi.string().guid().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

// TODO: smarter validation of enforcementDate+expirationDate here...
const add = {
  body: Joi.object().keys({
    receiverWallet: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
    enforcementDate: Joi.date().iso().required(),
    expirationDate: Joi.date().iso().greater('now').required(),
  }),
};

const spend = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
  }),
};

const transfer = {
  body: Joi.object().keys({
    ownerWallet: Joi.string().guid().required(),
    receiverWallet: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
  }),
};

module.exports = {
  balance,
  history,
  add,
  spend,
  transfer,
};
