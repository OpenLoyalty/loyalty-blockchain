const Joi = require('joi').extend(require('@joi/date'));
const { joiGenerate } = require('../../utils/username-generator');
const { password } = require('../custom.validation');

const create = {
  body: Joi.object().keys({
    username: Joi.string().default(joiGenerate),
    password: Joi.string().required().custom(password),
    organization: Joi.string().required(),
    role: Joi.string().required().valid('client', 'admin'),
  }),
};

module.exports = {
  create,
};
