const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { pointsValidation } = require('../../validations');
const { pointsController } = require('../../controllers');

const router = express.Router();

router.route('/balance').get(auth(), validate(pointsValidation.balance), pointsController.getBalance);
router.route('/history').get(auth(), validate(pointsValidation.history), pointsController.getHistory);
router.route('/spend').post(auth(), validate(pointsValidation.spend), pointsController.spendPoints);
router.route('/transfer').post(auth(), validate(pointsValidation.transfer), pointsController.transferPoints);

module.exports = router;
