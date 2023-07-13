const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { adminValidation } = require('../../../validations');
const { adminController } = require('../../../controllers');

const router = express.Router();

router
  .route('/add')
  .post(auth('manageUsers'), validate(adminValidation.pointsValidation.add), adminController.pointsController.addPoints);
router
  .route('/spend')
  .post(auth('manageUsers'), validate(adminValidation.pointsValidation.spend), adminController.pointsController.spendPoints);
router
  .route('/transfer')
  .post(
    auth('manageUsers'),
    validate(adminValidation.pointsValidation.transfer),
    adminController.pointsController.transferPoints
  );
// router.route('/tx/:txId').get(auth('manageUsers'), validate(adminValidation.getTx), payController.getTx);

module.exports = router;
