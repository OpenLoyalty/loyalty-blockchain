const httpStatus = require('http-status');
const _ = require('lodash');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  userService,
  orgService,
  pointsService,
  prepaidCardService,
  giftCardService,
  utilityTokenService,
  voucherService,
} = require('../services');

const createUser = catchAsync(async (req, res) => {
  const orgObj = await orgService.getByName(req.body.organization, { ca: true });
  if (req.body.role === undefined) {
    req.body.role = 'client';
  }
  const user = await userService.createUser(req.body, orgObj);
  res.status(httpStatus.CREATED).send({ user: _.pick(user, ['username', 'userUuid', 'role', 'organization']) });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = _.pick(req.query, ['username', 'role']);
  const options = _.pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(_.map(Object.values(result), (obj) => _.pick(obj, ['username', 'userUuid', 'role'])));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserByUuid(req.params.wallet);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const userPoints = await pointsService.getBalance(user);
  const prepaidCards = await prepaidCardService.getAssets(user);
  const giftCards = await giftCardService.getAssets(user);
  const vouchers = await voucherService.getAssets(user);
  // const utilityTokens = await utilityTokenService.getAssets(user);
  res.send({
    user: _.pick(user, ['username', 'userUuid', 'role']),
    points: userPoints.activeUnits,
    assets: {
      prepaidCards: _.map(Object.values(prepaidCards), 'asset_id'),
      giftCards: _.map(Object.values(giftCards), 'asset_id'),
      vouchers: _.map(Object.values(vouchers), 'asset_id'),
      utilityTokens: 'Coming soon',
      // utilityTokens: _.map(Object.values(utilityTokens), 'asset_id'),
    },
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserByUsername(req.params.username, req.body);
  res.send({ user: _.pick(user, ['username', 'userUuid', 'role']) });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserByUsername(req.params.username);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
