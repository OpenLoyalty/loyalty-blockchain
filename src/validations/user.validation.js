const Joi = require('joi').extend(require('@joi/date'));
const { password } = require('./custom.validation');
const { joiGenerate } = require('../utils/username-generator');

const createUser = {
  body: Joi.object().keys({
    username: Joi.string().default(joiGenerate),
    password: Joi.string().required().custom(password),
    organization: Joi.string().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    username: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    wallet: Joi.string(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    username: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      username: Joi.string(),
      password: Joi.string().custom(password),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    username: Joi.string(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
