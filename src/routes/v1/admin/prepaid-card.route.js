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
    validate(adminValidation.prepaidCardValidation.create),
    adminController.prepaidCardController.createCard
  );
router
  .route('/spend')
  .post(
    auth('manageUsers'),
    validate(adminValidation.prepaidCardValidation.spend),
    adminController.prepaidCardController.spendFromCard
  );
router
  .route('/transfer')
  .post(
    auth('manageUsers'),
    validate(adminValidation.prepaidCardValidation.transfer),
    adminController.prepaidCardController.transferCard
  );
router
  .route('/recharge')
  .post(
    auth('manageUsers'),
    validate(adminValidation.prepaidCardValidation.recharge),
    adminController.prepaidCardController.rechargeCard
  );
// router.route('/tx/:txId').get(auth('manageUsers'), validate(prepaidCardValidation.getTx), prepaidCardController.getTx);

module.exports = router;
