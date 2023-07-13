const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const prisma = require('../prisma/client');

/**
 * Check if name is already taken excluding
 * @param {string} name
 */
const checkNameTaken = async (name) => {
  const exists = await prisma.CA.findUnique({
    where: {
      name,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
};

/**
 * Create a org
 * @param {Object} orgBody
 * @returns {Promise<Org>}
 */
const create = async (orgBody) => {
  await checkNameTaken(orgBody.name);
  return prisma.Org.create({
    data: orgBody,
  });
};

/**
 * Query for orgs
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {object} [options.orderBy] - Sort option in the format: {sortField:(desc|asc)}
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const query = async (filter, options) => {
  return prisma.Org.findMany({
    skip: options.limit * (options.page - 1),
    take: options.limit,
    where: filter,
    orderBy: options.orderBy,
  });
};

/**
 * Get org by id
 * @param {BigInteger} id
 * @returns {Promise<Org>}
 */
const getOrgById = async (id) => {
  return prisma.Org.findUnique({
    where: { id },
  });
};

/**
 * Get org by name
 * @param {string} name
 * @returns {Org}
 */
const getByName = async (name) => {
  const org = await prisma.Org.findUnique({
    where: { name },
  });
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, `Organization ${name} not found`);
  }
  return org;
};

/**
 * add Peer reference to Org (by orgId)
 * @param {BigInteger} orgId
 * @param {BigInteger} peerId
 * @returns {Promise<Org>}
 */
const updateOrgByIdAddPeer = async (orgId, peerId) => {
  const org = await getOrgById(orgId);
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
  }
  return prisma.Org.update({
    where: { id: orgId },
    data: {
      peers: { connect: [{ id: peerId }] },
    },
  });
};

/**
 * Set CA reference to Org (by orgId)
 * @param {BigInteger} orgId
 * @param {BigInteger} caId
 * @returns {Promise<Org>}
 */
const updateOrgByIdSetCA = async (orgId, caId) => {
  const org = await getOrgById(orgId);
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
  }
  return prisma.Org.update({
    where: { id: orgId },
    data: {
      ca: { connect: { id: caId } },
    },
  });
};

/**
 * Update org by id
 * @param {BigInteger} orgId
 * @param {Object} updateBody
 * @returns {Promise<Org>}
 */
const updateOrgById = async (orgId, updateBody) => {
  const org = await getOrgById(orgId);
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
  }
  await checkNameTaken(updateBody.name);

  if (updateBody.name) {
    await checkNameTaken(updateBody.name, orgId);
  }
  return prisma.Org.update({
    where: { id: orgId },
    data: updateBody,
  });
};

/**
 * Delete org by id
 * @param {BigInteger} orgId
 * @returns {Promise<Org>}
 */
const deleteOrgById = async (orgId) => {
  try {
    return prisma.Org.delete({
      where: { id: orgId },
    });
  } catch (e) {
    if (e instanceof Prisma.NotFoundError) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Org not found');
    } else {
      logger.error(`caught error: ${e}`);
    }
  }
};

module.exports = {
  create,
  query,
  getOrgById,
  getByName,
  updateOrgById,
  updateOrgByIdAddPeer,
  updateOrgByIdSetCA,
  deleteOrgById,
};
