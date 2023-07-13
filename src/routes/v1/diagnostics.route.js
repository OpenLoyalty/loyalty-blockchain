const express = require('express');
const { diagnosticsController } = require('../../controllers');

const router = express.Router();

router.route('/healthy').get(diagnosticsController.getIsHealthy);

module.exports = router;
