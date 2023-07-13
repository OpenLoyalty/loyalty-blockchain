const express = require('express');
const auth = require('../../../../middlewares/auth');
const validate = require('../../../../middlewares/validate');
const { channelValidation } = require('../../../../validations/admin/network');
const { channelController } = require('../../../../controllers/admin/network');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(channelValidation.create), channelController.create)
  .get(auth('manageConfig'), validate(channelValidation.query), channelController.query);
router
  .route('/:name')
  .put(auth('manageConfig'), validate(channelValidation.update), channelController.update)
  .get(auth('manageConfig'), validate(channelValidation.get), channelController.get)
  .delete(auth('manageConfig'), channelController.remove);

module.exports = router;
