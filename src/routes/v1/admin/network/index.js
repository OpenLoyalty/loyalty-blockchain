const express = require('express');
const caRoute = require('./ca.route');
const chaincodeRoute = require('./chaincode.route');
const channelRoute = require('./channel.route');
const orgRoute = require('./org.route');
const peerRoute = require('./peer.route');

const router = express.Router();

router.use('/ca', caRoute);
router.use('/chaincode', chaincodeRoute);
router.use('/channel', channelRoute);
router.use('/org', orgRoute);
router.use('/peer', peerRoute);

module.exports = router;
