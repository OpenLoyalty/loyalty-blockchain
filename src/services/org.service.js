const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const prisma = require('../prisma/client');

/**
 * Check if name is already taken excluding passed orgId
 * @param {string} name
 */
const checkNameTaken = async (name) => {
  const exists = await prisma.Org.findUnique({
    where: {
      name,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
};

/**
 * Create an organization
 * @param {Object} orgBody
 * @returns {Promise<Org>}
 */
const create = async (orgBody) => {
  logger.info(`create org: ${JSON.stringify(orgBody, null, 2)}`);
  await checkNameTaken(orgBody.name);
  const createdOrg = await prisma.Org.create({
    data: orgBody,
  });
  return createdOrg;
};

/**
 * Update org by unique orgName
 * @param {string} orgName
 * @param {Object} updateBody
 * @returns {Promise<Org>}
 */
const updateByName = async (orgName, updateBody) => {
  try {
    return prisma.Org.update({
      where: { name: orgName },
      data: { ...updateBody },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
    } else {
      logger.error(`caught error: ${e}`);
    }
  }
};

/**
 * Delete org by unique orgName
 * @param {string} orgName
 */
const deleteByName = async (orgName) => {
  try {
    return prisma.Org.delete({
      where: { name: orgName },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
    } else {
      logger.error(`caught error: ${e}`);
    }
  }
};

/**
 * Query for orgs
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Object} include - nested query includes
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options, include) => {
  return prisma.Org.findMany({
    skip: options.limit * (options.page - 1),
    take: options.limit,
    where: filter,
    include: include && { peers: !!include.peers, ca: !!include.ca, channels: !!include.channels },
    orderBy: options.orderBy,
  });
};

/**
 * Get org by name
 * @param {string} name
 * @param {Object} include
 * @returns {Org}
 * 
 */
const getByName = async (name, include = null) => {
  const org = await prisma.Org.findUnique({
    where: { name },
    include,
  });
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, `Organization ${name} not found`);
  }
  return org;
};

module.exports = {
  create,
  updateByName,
  deleteByName,
  checkNameTaken,
  query,
  getByName,
};
