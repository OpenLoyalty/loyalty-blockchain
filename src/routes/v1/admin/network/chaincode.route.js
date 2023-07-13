const express = require('express');
const auth = require('../../../../middlewares/auth');
const validate = require('../../../../middlewares/validate');
const { chaincodeValidation } = require('../../../../validations/admin/network');
const { chaincodeController } = require('../../../../controllers/admin/network');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(chaincodeValidation.create), chaincodeController.create)
  .get(auth('manageConfig'), validate(chaincodeValidation.query), chaincodeController.query);
router
  .route('/:id')
  .put(auth('manageConfig'), validate(chaincodeValidation.update), chaincodeController.update)
  .get(auth('manageConfig'), validate(chaincodeValidation.get), chaincodeController.get)
  .delete(auth('manageConfig'), chaincodeController.remove);

module.exports = router;
