const httpStatus = require('http-status');
const _ = require('lodash');
const catchAsync = require('../../../utils/catchAsync');
const { orgService } = require('../../../services');
const { peerService } = require('../../../services/admin/network');

const create = catchAsync(async (req, res) => {
  const org = await orgService.getByName(req.body.orgName);
  const result = await peerService.create({
    ..._.pick(req.body, ['name', 'url', 'tlsCaCert']),
    organization: org,
  });
  res.status(httpStatus.CREATED).send(result);
});

const update = catchAsync(async (req, res) => {
  const updateBody = _.pick(req.body, ['name', 'url', 'tlsCaCert']);
  if (req.body.orgName) {
    await orgService.checkNameTaken(req.body.orgName);
    updateBody.org = await orgService.getByName(req.body.orgName);
  }

  const result = await peerService.updateByName(req.params.name, updateBody);
  res.status(httpStatus.OK).send(result);
});

const get = catchAsync(async (req, res) => {
  const result = await peerService.getByName(req.params.name);
  res.status(httpStatus.OK).send(result);
});

const remove = catchAsync(async (req, res) => {
  await peerService.deleteByName(req.params.name);
  res.status(httpStatus.OK).send();
});

const query = catchAsync(async (req, res) => {
  const filter = _.pick(req.query, ['name', 'organization']);
  const options = _.pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await peerService.query(filter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  create,
  update,
  get,
  remove,
  query,
};
