const httpStatus = require('http-status');
const _ = require('lodash');
const catchAsync = require('../../../utils/catchAsync');
const { orgService, userService } = require('../../../services');

const create = catchAsync(async (req, res) => {
  const result = await orgService.create({
    ..._.pick(req.body, ['name', 'mspId']),
  });
  res.status(httpStatus.CREATED).send(result);
});

const update = catchAsync(async (req, res) => {
  await orgService.getByName(req.params.name);
  const updateBody = _.pick(req.body, ['name', 'mspId']);
  if (updateBody.name) {
    await orgService.checkNameTaken(req.body.name);
  }

  const result = await orgService.updateByName(req.params.name, updateBody);
  res.status(httpStatus.OK).send(result);
});

const get = catchAsync(async (req, res) => {
  const result = await orgService.getByName(req.params.name);
  res.status(httpStatus.OK).send(result);
});

const remove = catchAsync(async (req, res) => {
  await orgService.deleteByName(req.params.name);
  res.status(httpStatus.OK).send();
});

const query = catchAsync(async (req, res) => {
  const filter = _.pick(req.query, ['name', 'mspId']);
  const options = _.pick(req.query, ['sortBy', 'limit', 'page']);
  const includes = _.pick(req.query, ['peers', 'ca', 'channels']);
  const result = await orgService.query(filter, options, includes);
  res.status(httpStatus.OK).send(result);
});

const createAdmin = catchAsync(async (req, res) => {
  const org = await orgService.getByName(req.params.orgName, { ca: true });
  const result = await userService.createOrgAdminUser(org, `${org.name}-admin`);
  res.status(httpStatus.CREATED).send(result);
});

const getAdmin = catchAsync(async (req, res) => {
  const result = await userService.getUserByUsername(`${req.params.orgName}-admin`);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  create,
  update,
  get,
  remove,
  query,
  createAdmin,
  getAdmin,
};
