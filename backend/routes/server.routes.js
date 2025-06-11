const express = require('express');
const router = express.Router();
const validateServer = require('../middleware/validate.middleware.js');
const serverController = require('../controller/validate.controller.js');

// Existing route
router.get('/servers/:query?', serverController.fetchServers);
router.get('/stored',validateServer, serverController.getStoredServers);

module.exports = router;