const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { adminValidation, userValidation } = require('../../../validations');
const { userController, adminController } = require('../../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(adminValidation.userValidation.create), userController.createUser)
  .get(auth('manageUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:wallet')
  .get(auth('manageUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:wallet/points/balance')
  .get(auth('manageUsers'), validate(adminValidation.pointsValidation.balance), adminController.pointsController.getBalance);

router
  .route('/:wallet/points/history')
  .get(auth('manageUsers'), validate(adminValidation.pointsValidation.history), adminController.pointsController.getHistory);

router
  .route('/:wallet/prepaid-card/:cardId/balance')
  .get(
    auth('manageUsers'),
    validate(adminValidation.prepaidCardValidation.balance),
    adminController.prepaidCardController.getBalance
  );

router
  .route('/:wallet/prepaid-card/:cardId/history')
  .get(
    auth('manageUsers'),
    validate(adminValidation.prepaidCardValidation.history),
    adminController.prepaidCardController.getHistory
  );
router
  .route('/:wallet/gift-card/:cardId/balance')
  .get(
    auth('manageUsers'),
    validate(adminValidation.giftCardValidation.balance),
    adminController.giftCardController.getBalance
  );

router
  .route('/:wallet/gift-card/:cardId/history')
  .get(
    auth('manageUsers'),
    validate(adminValidation.giftCardValidation.history),
    adminController.giftCardController.getHistory
  );
router
  .route('/:wallet/utility-token/:cardId/balance')
  .get(
    auth('manageUsers'),
    validate(adminValidation.utilityTokenValidation.getBalance),
    adminController.utilityTokenController.getBalance
  );

router
  .route('/:wallet/utility-token/:cardId/history')
  .get(
    auth('manageUsers'),
    validate(adminValidation.utilityTokenValidation.getHistory),
    adminController.utilityTokenController.getHistory
  );
router
  .route('/:wallet/voucher/:cardId/balance')
  .get(
    auth('manageUsers'),
    validate(adminValidation.voucherValidation.balance),
    adminController.voucherController.getBalance
  );

router
  .route('/:wallet/voucher/:cardId/history')
  .get(
    auth('manageUsers'),
    validate(adminValidation.voucherValidation.history),
    adminController.voucherController.getHistory
  );

module.exports = router;
