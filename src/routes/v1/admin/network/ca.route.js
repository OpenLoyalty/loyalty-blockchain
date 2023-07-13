const express = require('express');
const auth = require('../../../../middlewares/auth');
const validate = require('../../../../middlewares/validate');
const { caValidation } = require('../../../../validations/admin/network');
const { caController } = require('../../../../controllers/admin/network');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(caValidation.create), caController.create)
  .get(auth('manageConfig'), validate(caValidation.query), caController.query);
router
  .route('/:name')
  .put(auth('manageConfig'), validate(caValidation.update), caController.update)
  .get(auth('manageConfig'), validate(caValidation.get), caController.get)
  .delete(auth('manageConfig'), caController.remove);

module.exports = router;
