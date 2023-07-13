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
    validate(adminValidation.voucherValidation.create),
    adminController.voucherController.createCard
  );
router
  .route('/spend')
  .post(
    auth('manageUsers'),
    validate(adminValidation.voucherValidation.spend),
    adminController.voucherController.spendFromCard
  );
router
  .route('/transfer')
  .post(
    auth('manageUsers'),
    validate(adminValidation.voucherValidation.transfer),
    adminController.voucherController.transferCard
  );
// router.route('/tx/:txId').get(auth('manageUsers'), validate(voucherValidation.getTx), voucherController.getTx);

module.exports = router;
