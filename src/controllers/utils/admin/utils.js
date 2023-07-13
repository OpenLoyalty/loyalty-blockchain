const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');

/**
 * Verify that users involved in a transaction are eligible to do so
 * @param {...*} [users]
 * @returns {User}
 */
const validateUserOrgConsistency = (...users) => {
  return users.reduce(function (prev, next) {
    if (prev.orgId !== next.orgId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Involved actors cannot transact with each other');
    }
    return next;
  });
};

module.exports = {
  validateUserOrgConsistency,
};
