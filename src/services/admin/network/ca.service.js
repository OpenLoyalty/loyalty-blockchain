const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const _ = require('lodash');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../config/logger');
const prisma = require('../../../prisma/client');

/**
 * Check if name is already taken
 * @param {string} name
 */
const checkNameTaken = async (name) => {
  const exists = await prisma.CA.findUnique({
    where: {
      name,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'CA name already taken');
  }
};

/**
 * Create a CA configuration
 * @param {Object} caBody
 * @returns {Promise<CA>}
 */
const create = async (caBody) => {
  logger.info(`create ca: ${JSON.stringify(caBody, null, 2)}`);
  await checkNameTaken(caBody.name);
  const createdCA = await prisma.CA.create({
    data: {
      ...caBody,
      organization: {
        connect: { id: caBody.organization.id },
      },
    },
  });
  return createdCA;
};

/**
 * Get CA by ca name
 * @param {String} name
 * @param {Object} include
 * @returns {Promise<CA>}
 */
const getByName = async (name, include = null) => {
  const ca = await prisma.CA.findUnique({
    where: { name },
    include,
  });
  if (!ca) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CA not found');
  }
  return ca;
};

/**
 * Update CA by unique caName
 * @param {string} caName
 * @param {Object} updateBody
 * @returns {Promise<CA>}
 */
const updateByName = async (caName, updateBody) => {
  try {
    return prisma.CA.update({
      where: { name: caName },
      data: {
        ..._.pick(updateBody, ['name', 'url', 'tlsCaCert', 'enrollId', 'enrollSecret']),
        ...(updateBody.org && { organization: { connect: { id: updateBody.org.id } } }),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'CA not found');
    } else {
      logger.error(`caught error: ${e}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'CA lookup failed');
    }
  }
};

/**
 * Delete CA by unique caName
 * @param {string} caName
 */
const deleteByName = async (caName) => {
  await getByName(caName);
  try {
    await prisma.CA.delete({
      where: { name: caName },
    });
  } catch (e) {
    logger.error(`caught error: ${e}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'CA lookup failed');
  }
};

/**
 * Query existing ca configurations
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options) => {
  return prisma.CA.findMany({
    skip: options.limit * (options.page - 1),
    take: options.limit,
    where: filter,
    orderBy: options.orderBy,
  });
};

module.exports = {
  create,
  getByName,
  updateByName,
  deleteByName,
  query,
};
