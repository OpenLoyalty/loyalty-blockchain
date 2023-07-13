const Joi = require('joi').extend(require('@joi/date'));

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    mspId: Joi.string().required(),
  }),
};

const update = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    mspId: Joi.string(),
  }),
};

const updateAddPeer = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    peerName: Joi.string().required(),
  }),
};

const updateSetCA = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
  body: Joi.object().keys({
    caName: Joi.number().integer().positive().required(),
  }),
};

const query = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string().default('name'),
    limit: Joi.number().integer().default(20),
    page: Joi.number().integer().default(1),
    peers: Joi.boolean().default(true),
    ca: Joi.boolean().default(true),
    channels: Joi.boolean().default(true),
  }),
};

const get = {
  params: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const createAdmin = {
  params: Joi.object().keys({
    orgName: Joi.string().required(),
  }),
};

const getAdmin = {
  params: Joi.object().keys({
    orgName: Joi.string().required(),
  }),
};

module.exports = {
  create,
  update,
  updateAddPeer,
  updateSetCA,
  query,
  get,
  createAdmin,
  getAdmin,
};
