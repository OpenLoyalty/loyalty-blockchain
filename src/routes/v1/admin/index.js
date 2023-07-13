const express = require('express');
const networkRoute = require('./network');
const userRoute = require('./user.route');
const pointsRoute = require('./points.route');
const prepaidCardRoute = require('./prepaid-card.route');
const giftCardRoute = require('./gift-card.route');
const utilityTokenRoute = require('./utility-token-route');
const voucherRoute = require('./voucher.route');

const router = express.Router();

router.use('/network', networkRoute);
router.use('/user', userRoute);
router.use('/points', pointsRoute);
router.use('/prepaid-card', prepaidCardRoute);
router.use('/gift-card', giftCardRoute);
router.use('/utility-token', utilityTokenRoute);
router.use('/voucher', voucherRoute);

module.exports = router;
