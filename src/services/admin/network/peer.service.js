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
  const exists = await prisma.Peer.findUnique({
    where: {
      name,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Peer name already taken');
  }
};

/**
 * Create a peer configuration
 * @param {Object} peerBody
 * @returns {Promise<Peer>}
 */
const create = async (peerBody) => {
  logger.info(`create peer: ${JSON.stringify(peerBody, null, 2)}`);
  await checkNameTaken(peerBody.name);
  const createdPeer = await prisma.Peer.create({
    data: {
      ...peerBody,
      organization: {
        connect: { id: peerBody.organization.id },
      },
    },
  });
  return createdPeer;
};

/**
 * Get peer by peer name
 * @param {String} name
 * @param {Object} include
 * @returns {Promise<Peer>}
 */
const getByName = async (name, include = null) => {
  const peer = await prisma.Peer.findUnique({
    where: { name },
    include,
  });
  if (!peer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Peer not found');
  }
  return peer;
};

/**
 * Update peer by unique peerName
 * @param {string} peerName
 * @param {Object} updateBody
 * @returns {Promise<Peer>}
 */
const updateByName = async (peerName, updateBody) => {
  try {
    const peer = await prisma.Peer.update({
      where: { name: peerName },
      data: {
        ..._.pick(updateBody, ['name', 'url', 'tlsCaCert']),
        ...(updateBody.org && { organization: { connect: { id: updateBody.org.id } } }),
      },
    });
    return peer;
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Peer not found');
    } else {
      logger.error(`caught error: ${e}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Peer lookup failed');
    }
  }
};

/**
 * Delete peer by unique peerName
 * @param {string} peerName
 */
const deleteByName = async (peerName) => {
  await getByName(peerName);
  try {
    await prisma.Peer.delete({
      where: { name: peerName },
    });
  } catch (e) {
    logger.error(`caught error: ${e}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Peer lookup failed');
  }
};

/**
 * Query existing peer configurations
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options) => {
  return prisma.Peer.findMany({
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
