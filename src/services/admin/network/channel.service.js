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
  const exists = await prisma.Channel.findUnique({
    where: {
      name,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Channel name already taken');
  }
};

/**
 * Create a channel configuration
 * @param {Object} channelBody
 * @returns {Promise<Channel>}
 */
const create = async (channelBody) => {
  logger.info(`create channel: ${JSON.stringify(channelBody, null, 2)}`);
  await checkNameTaken(channelBody.name);
  const createdChannel = await prisma.Channel.create({
    data: {
      ...channelBody,
      organization: {
        connect: { id: channelBody.organization.id },
      },
    },
  });
  return createdChannel;
};

/**
 * Get channel by channel name
 * @param {String} name
 * @param {Object} include
 * @returns {Promise<Channel>}
 */
const getByName = async (name, include = null) => {
  const channel = await prisma.Channel.findUnique({
    where: { name },
    include,
  });
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
  }
  return channel;
};

/**
 * Update channel by unique channelName
 * @param {string} channelName
 * @param {Object} updateBody
 * @returns {Promise<Channel>}
 */
const updateByName = async (channelName, updateBody) => {
  try {
    return prisma.Channel.update({
      where: { name: channelName },
      data: {
        ..._.pick(updateBody, ['name']),
        ...(updateBody.org && { organization: { connect: { id: updateBody.org.id } } }),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
    } else {
      logger.error(`caught error: ${e}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Channel lookup failed');
    }
  }
};

/**
 * Delete channel by unique channelName
 * @param {string} channelName
 */
const deleteByName = async (channelName) => {
  await getByName(channelName);
  try {
    await prisma.Channel.delete({
      where: { name: channelName },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
    } else {
      logger.error(`caught error: ${e}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Channel lookup failed');
    }
  }
};

/**
 * Query existing channel configurations
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options) => {
  return prisma.Channel.findMany({
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
