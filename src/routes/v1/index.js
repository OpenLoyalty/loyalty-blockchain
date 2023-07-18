const express = require('express');
const authRoute = require('./auth.route');
const adminRoute = require('./admin');
const pointsRoute = require('./points.route');
const giftCardRoute = require('./gift-card.route');
const prepaidCardRoute = require('./prepaid-card.route');
// const voucherRoute = require('./voucher.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const diagnosticsRoute = require('./diagnostics.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/diagnostics',
    route: diagnosticsRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/points',
    route: pointsRoute,
  },
  {
    path: '/gift-card',
    route: giftCardRoute,
  },
  {
    path: '/prepaid-card',
    route: prepaidCardRoute,
  },
  // {
  //   path: '/voucher',
  //   route: voucherRoute,
  // },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
