const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { adminValidation } = require('../../../validations');
const { adminController } = require('../../../controllers');

const router = express.Router();

router
  .route('/create')
  .post(
    auth('manageUsers'),
    validate(adminValidation.utilityTokenValidation.create),
    adminController.utilityTokenController.createCard
  );
router
  .route('/use')
  .post(
    auth('manageUsers'),
    validate(adminValidation.utilityTokenValidation.use),
    adminController.utilityTokenController.useCard
  );
router
  .route('/transfer')
  .post(
    auth('manageUsers'),
    validate(adminValidation.utilityTokenValidation.transfer),
    adminController.utilityTokenController.transferCard
  );

// router.route('/tx/:txId').get(auth('manageUsers'), validate(utilityTokenValidation.getTx), utilityTokenController.getTx);

module.exports = router;
