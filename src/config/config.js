const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi').extend(require('@joi/date'));

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    HL_TOPOLOGY_CONFIG_FILE: Joi.string().required().description('Location of config file describing HL network topology'),
    LOG_LEVEL: Joi.string().default('info'),
    DATABASE_URL: Joi.string().required().description('Database user passwd'),
    JWT_SECRET: Joi.string().default('jwtsecret').description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(300).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  hl_topology: envVars.HL_TOPOLOGY_CONFIG_FILE,
  loglevel: envVars.LOG_LEVEL,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  },
};
