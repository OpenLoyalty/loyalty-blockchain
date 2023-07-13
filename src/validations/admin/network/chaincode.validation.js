const Joi = require('joi').extend(require('@joi/date'));

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    channelName: Joi.string().required(),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    channelName: Joi.string(),
  }),
};

const query = {
  query: Joi.object().keys({
    name: Joi.string(),
    channelName: Joi.string(),
    sortBy: Joi.string().default('name'),
    limit: Joi.number().integer().default(20),
    page: Joi.number().integer().default(1),
  }),
};

const get = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = {
  create,
  update,
  query,
  get,
};
