const Joi = require('joi').extend(require('@joi/date'));

const balance = {
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const history = {
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const spend = {
  body: Joi.object().keys({
    amount: Joi.number().integer().positive().required(),
  }),
};

const transfer = {
  body: Joi.object().keys({
    receiverWallet: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
  }),
};

module.exports = {
  balance,
  history,
  spend,
  transfer,
};
