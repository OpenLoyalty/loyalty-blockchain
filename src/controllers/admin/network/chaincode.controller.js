const httpStatus = require('http-status');
const _ = require('lodash');
const catchAsync = require('../../../utils/catchAsync');
const { channelService, chaincodeService } = require('../../../services/admin/network');

const create = catchAsync(async (req, res) => {
  const channel = await channelService.getByName(req.body.channelName);
  const result = await chaincodeService.create({
    ..._.pick(req.body, ['name']),
    channel,
  });
  res.status(httpStatus.CREATED).send(result);
});

const update = catchAsync(async (req, res) => {
  const updateBody = _.pick(req.body, ['name']);
  if (req.body.channelName) {
    await chaincodeService.checkNameTaken(req.body.channelName);
    updateBody.channel = await channelService.getByName(req.body.channelName);
  }

  const result = await chaincodeService.updateById(parseInt(req.params.id, 10), updateBody);
  res.status(httpStatus.OK).send(result);
});

const get = catchAsync(async (req, res) => {
  const result = await chaincodeService.getById(parseInt(req.params.id, 10));
  res.status(httpStatus.OK).send(result);
});

const remove = catchAsync(async (req, res) => {
  await chaincodeService.deleteById(parseInt(req.params.id, 10));
  res.status(httpStatus.OK).send();
});

const query = catchAsync(async (req, res) => {
  const filter = _.pick(req.query, ['name', 'channelName']);
  const options = _.pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await chaincodeService.query(filter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  create,
  update,
  get,
  remove,
  query,
};
