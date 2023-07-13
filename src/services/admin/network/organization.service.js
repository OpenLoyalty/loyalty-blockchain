const httpStatus = require('http-status');
const { Prisma } = require('@prisma/client');
const ApiError = require('../../../utils/ApiError');
const logger = require('../../../config/logger');
const prisma = require('../../../prisma/client');

/**
 * Create a org
 * @param {Object} orgBody
 * @returns {Promise<Org>}
 */
const create = async (orgBody) => {
  return prisma.Org.create({
    data: orgBody,
  });
};

/**
 * add Peer reference to Org (by Org name)
 * @param {string} orgName
 * @param {BigInteger} peerId
 * @returns {Promise<Org>}
 */
// eslint-disable-next-line camelcase
const updateByName_AddPeer = async (orgName, peerId) => {
  try {
    return prisma.Org.update({
      where: { name: orgName },
      data: {
        peers: { connect: [{ id: peerId }] },
      },
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
 * Set CA reference to Org (by Org name)
 * @param {string} orgName
 * @param {BigInteger} caId
 * @returns {Promise<Org>}
 */
// eslint-disable-next-line camelcase
const updateByName_SetCA = async (orgName, caId) => {
  try {
    return prisma.Org.update({
      where: { name: orgName },
      data: {
        ca: { connect: { id: caId } },
      },
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
 * Update org by Org name
 * @param {string} orgName
 * @param {Object} updateBody
 * @returns {Promise<Org>}
 */
const updateByName = async (orgName, updateBody) => {
  try {
    return prisma.Org.update({
      where: { name: orgName },
      data: updateBody,
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
 * Delete org by id
 * @param {string} orgName
 * @returns {Promise<Org>}
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

module.exports = {
  create,
  updateByName,
  updateByName_AddPeer,
  updateByName_SetCA,
  deleteByName,
};
