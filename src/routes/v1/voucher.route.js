const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { voucherValidation } = require('../../validations');
const { voucherController } = require('../../controllers');

const router = express.Router();

router.route('/:cardId/balance').get(auth(), validate(voucherValidation.balance), voucherController.getBalance);
router.route('/:cardId/history').get(auth(), validate(voucherValidation.history), voucherController.getHistory);
router.route('/spend').post(auth(), validate(voucherValidation.spend), voucherController.spendFromCard);
router.route('/transfer').post(auth(), validate(voucherValidation.transfer), voucherController.transferCard);

module.exports = router;
