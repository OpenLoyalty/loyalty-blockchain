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
    validate(adminValidation.giftCardValidation.create),
    adminController.giftCardController.createCard
  );
router
  .route('/spend')
  .post(
    auth('manageUsers'),
    validate(adminValidation.giftCardValidation.spend),
    adminController.giftCardController.spendFromCard
  );
router
  .route('/transfer')
  .post(
    auth('manageUsers'),
    validate(adminValidation.giftCardValidation.transfer),
    adminController.giftCardController.transferCard
  );
// router.route('/tx/:txId').get(auth('manageUsers'), validate(giftCardValidation.getTx), giftCardController.getTx);

module.exports = router;
