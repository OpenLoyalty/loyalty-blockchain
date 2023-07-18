const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { giftCardValidation } = require('../../validations');
const { giftCardController } = require('../../controllers');

const router = express.Router();

router.route('/:cardId/balance').get(auth(), validate(giftCardValidation.balance), giftCardController.getBalance);
router.route('/:cardId/history').get(auth(), validate(giftCardValidation.history), giftCardController.getHistory);
router.route('/spend').post(auth(), validate(giftCardValidation.spend), giftCardController.spendFromCard);
router.route('/transfer').post(auth(), validate(giftCardValidation.transfer), giftCardController.transferCard);

module.exports = router;
