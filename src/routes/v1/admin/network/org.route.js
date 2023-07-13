const express = require('express');
const auth = require('../../../../middlewares/auth');
const validate = require('../../../../middlewares/validate');
const { orgValidation } = require('../../../../validations/admin/network');
const { orgController } = require('../../../../controllers/admin/network');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(orgValidation.create), orgController.create)
  .get(auth('manageConfig'), validate(orgValidation.query), orgController.query);
router
  .route('/admin-user/:orgName')
  .post(auth('manageConfig'), validate(orgValidation.createAdmin), orgController.createAdmin)
  .get(auth('manageConfig'), validate(orgValidation.getAdmin), orgController.getAdmin);
router
  .route('/:name')
  .put(auth('manageConfig'), validate(orgValidation.update), orgController.update)
  .get(auth('manageConfig'), validate(orgValidation.get), orgController.get)
  .delete(auth('manageConfig'), orgController.remove);

module.exports = router;
