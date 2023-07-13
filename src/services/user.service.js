const httpStatus = require('http-status');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./utils/CAUtil');
const ApiError = require('../utils/ApiError');

/**
 * Check if password matches the user's password
 * @param {string} password1
 * @param {string} password2
 * @returns {Promise<boolean>}
 */
const isPasswordMatch = async function (password1, password2) {
  return bcrypt.compare(password1, password2);
};

/**
 * Check if name is already taken
 * @param {string} username
 */
const checkNameTaken = async (username) => {
  const exists = await prisma.User.findUnique({
    where: {
      username,
    },
  });

  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {Object} include
 * @returns {Promise<User>}
 */
const getUserById = async (id, include = null) => {
  return prisma.User.findUnique({ where: { id }, include });
};

/**
 * Get user by id
 * @param {String} userUuid
 * @param {Object} include
 * @returns {Promise<User>}
 */
const getUserByUuid = async (userUuid, include = null) => {
  const user = await prisma.User.findUnique({ where: { userUuid }, include });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User ${userUuid} not found`);
  }
  return user;
};

/**
 * Get user by username
 * @param {string} username
 * @param {Object} include
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username, include = null) => {
  const user = await prisma.User.findUnique({ where: { username }, include });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User ${username} not found`);
  }
  return user;
};

/**
 * Create an Org admin user
 * @param {Org} orgObj
 * @param {String} orgAdminUsername
 * @returns {Promise<User>}
 */
const createOrgAdminUser = async (orgObj, orgAdminUsername) => {
  await checkNameTaken(orgAdminUsername);
  const caClient = buildCAClient(orgObj.ca);
  const x509Identity = await enrollAdmin(
    { enrollId: orgObj.ca.enrollId, enrollSecret: orgObj.ca.enrollSecret },
    orgObj,
    caClient
  );
  const userObj = await prisma.User.create({
    data: {
      username: orgAdminUsername,
      password: orgObj.ca.enrollSecret,
      cert: x509Identity.credentials.certificate,
      privateKey: x509Identity.credentials.privateKey,
      role: 'admin',
      organization: {
        connect: { id: orgObj.id },
      },
    },
    include: {
      organization: true,
    },
  });
  return userObj;
};

/**
 * Create a user
 * @param {Object} userBody
 * @param {Org} orgObj
 * @returns {Promise<User>}
 */
const createUser = async (userBody, orgObj) => {
  await checkNameTaken(userBody.username);
  const caClient = buildCAClient(orgObj.ca);
  const userUuid = uuid.v4();
  const adminObj = await getUserByUsername(`${orgObj.mspId}-admin`);
  const x509Identity = await registerAndEnrollUser(caClient, orgObj, adminObj, userUuid, userBody.role);
  const userObj = await prisma.User.create({
    data: {
      ...userBody,
      userUuid,
      cert: x509Identity.credentials.certificate,
      privateKey: x509Identity.credentials.privateKey,
      organization: {
        connect: { id: orgObj.id },
      },
    },
    include: {
      organization: true,
    },
  });
  return userObj;
};

/**
 * Create a user
 * @param {Object} userBody
 * @param {Org} orgObj
 * @returns {Promise<User>}
 */
const createNonHlUser = async (userBody) => {
  return prisma.User.create({
    data: userBody,
  });
};

/**
 * Query for users
 * @param {Object} filter - SQL filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const orderBy = options.sortBy ? [{ [options.sortBy]: 'asc' }] : [{ id: 'asc' }];
  return prisma.User.findMany({
    where: filter,
    orderBy,
    skip: (options.page - 1) * options.limit || 0,
    take: options.limit || 20,
  });
};

/**
 * Update user by username
 * @param {String} username
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserByUsername = async (username, updateBody) => {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.username && (await prisma.User.isUsernameTaken(updateBody.username, user.id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  return prisma.User.update({
    where: {
      username,
    },
    data: user,
  });
};

/**
 * Delete user by username
 * @param {String} username
 * @returns {Promise<User>}
 */
const deleteUserByUsername = async (username) => {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return prisma.User.delete({
    where: {
      username,
    },
  });
};

module.exports = {
  isPasswordMatch,
  checkNameTaken,
  createOrgAdminUser,
  createUser,
  createNonHlUser,
  queryUsers,
  getUserByUuid,
  getUserById,
  getUserByUsername,
  updateUserByUsername,
  deleteUserByUsername,
};
