const Joi = require('joi').extend(require('@joi/date')).extend(require('joi-currency-code'));

const balance = {
  params: Joi.object().keys({
    cardId: Joi.string().guid().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const history = {
  params: Joi.object().keys({
    cardId: Joi.string().guid().required(),
  }),
  query: Joi.object().keys({
    verbosity: Joi.number().default(0),
  }),
};

const spend = {
  body: Joi.object().keys({
    cardId: Joi.string().guid().required(),
    amount: Joi.number().integer().positive().required(),
    currency: Joi.string().currency().required(),
  }),
};

const transfer = {
  body: Joi.object().keys({
    cardId: Joi.string().guid().required(),
    receiverWallet: Joi.string().guid().required(),
  }),
};

module.exports = {
  balance,
  history,
  spend,
  transfer,
};
