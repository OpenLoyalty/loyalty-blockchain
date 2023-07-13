const Joi = require('joi').extend(require('@joi/date'));

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    orgName: Joi.string().required(),
  }),
};

const update = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    orgName: Joi.string(),
  }),
};

const updateAddChaincode = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    chaincodeId: Joi.number().integer().positive().required(),
  }),
};

const query = {
  query: Joi.object().keys({
    name: Joi.string(),
    orgName: Joi.string(),
    sortBy: Joi.string().default('name'),
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
  updateAddChaincode,
  query,
  get,
};
