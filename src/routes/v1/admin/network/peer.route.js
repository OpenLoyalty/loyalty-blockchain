const express = require('express');
const auth = require('../../../../middlewares/auth');
const validate = require('../../../../middlewares/validate');
const { peerValidation } = require('../../../../validations/admin/network');
const { peerController } = require('../../../../controllers/admin/network');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(peerValidation.create), peerController.create)
  .get(auth('manageConfig'), validate(peerValidation.query), peerController.query);
router
  .route('/:name')
  .put(auth('manageConfig'), validate(peerValidation.update), peerController.update)
  .get(auth('manageConfig'), validate(peerValidation.get), peerController.get)
  .delete(auth('manageConfig'), peerController.remove);

module.exports = router;
