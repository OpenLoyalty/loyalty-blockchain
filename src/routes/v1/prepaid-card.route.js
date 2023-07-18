const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { prepaidCardValidation } = require('../../validations');
const { prepaidCardController } = require('../../controllers');

const router = express.Router();

router.route('/:cardId/balance').get(auth(), validate(prepaidCardValidation.balance), prepaidCardController.getBalance);
router.route('/:cardId/history').get(auth(), validate(prepaidCardValidation.history), prepaidCardController.getHistory);
router.route('/spend').post(auth(), validate(prepaidCardValidation.spend), prepaidCardController.spendFromCard);
router.route('/transfer').post(auth(), validate(prepaidCardValidation.transfer), prepaidCardController.transferCard);

module.exports = router;
