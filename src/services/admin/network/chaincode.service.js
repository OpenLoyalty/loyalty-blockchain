const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const _ = require('lodash');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../config/logger');
const prisma = require('../../../prisma/client');

/**
 * Create a chaincode configuration
 * @param {Object} chaincodeBody
 * @returns {Promise<Chaincode>}
 */
const create = async (chaincodeBody) => {
  logger.info(`create chaincode: ${JSON.stringify(chaincodeBody, null, 2)}`);
  const createdChaincode = await prisma.Chaincode.create({
    data: {
      ...chaincodeBody,
      channel: {
        connect: { id: chaincodeBody.channel.id },
      },
    },
  });
  return createdChaincode;
};

/**
 * Get chaincode by chaincode id
 * @param {number} id
 * @param {Object} include
 * @returns {Promise<Chaincode>}
 */
const getById = async (id, include = null) => {
  const chaincode = await prisma.Chaincode.findUnique({
    where: { id },
    include,
  });
  if (!chaincode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chaincode not found');
  }
  return chaincode;
};

/**
 * Update chaincode by unique chaincodeName
 * @param {number} id
 * @param {Object} updateBody
 * @returns {Promise<Chaincode>}
 */
const updateById = async (id, updateBody) => {
  try {
    const chaincode = await prisma.Chaincode.update({
      where: { id },
      data: {
        ..._.pick(updateBody, ['name']),
        ...(updateBody.org && { channel: { connect: { id: updateBody.channel.id } } }),
      },
    });
    return chaincode;
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Chaincode not found');
    } else {
      logger.error(`caught error: ${e}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Chaincode lookup failed');
    }
  }
};

/**
 * Delete chaincode by unique chaincodeName
 * @param {number} id
 */
const deleteById = async (id) => {
  await getById(id);
  try {
    await prisma.Chaincode.delete({
      where: { id },
    });
  } catch (e) {
    logger.error(`caught error: ${e}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Chaincode lookup failed');
  }
};

/**
 * Query existing chaincode configurations
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options) => {
  return prisma.Chaincode.findMany({
    skip: options.limit * (options.page - 1),
    take: options.limit,
    where: filter,
    orderBy: options.orderBy,
  });
};

module.exports = {
  create,
  getById,
  updateById,
  deleteById,
  query,
};
