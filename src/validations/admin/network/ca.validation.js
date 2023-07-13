const Joi = require('joi').extend(require('@joi/date'));

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    url: Joi.string().required(),
    orgName: Joi.string().required(),
    tlsCaCert: Joi.string(),
    enrollId: Joi.string().required(),
    enrollSecret: Joi.string().required(),
  }),
};

const update = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    url: Joi.string(),
    organization: Joi.string(),
    tlsCaCert: Joi.string(),
    enrollId: Joi.string(),
    enrollSecret: Joi.string(),
  }),
};

const query = {
  query: Joi.object().keys({
    name: Joi.string(),
    orgName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().default(20),
    page: Joi.number().integer().default(1),
  }),
};

const get = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

module.exports = {
  create,
  update,
  query,
  get,
};
