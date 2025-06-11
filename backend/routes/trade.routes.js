const express = require('express');
const router = express.Router();
const tradeController = require('../controller/tradingview.controller');
const auth = require('../middleware/auth1.middleware'); // Assuming you have auth middleware

// Protect all trade routes with authentication
router.use(auth);


router.post('/trade', tradeController.executeTrade);
router.get('/:accountId/data', tradeController.getAccountData);
// router.post('/fetchdata', accountController.fetchAccountData);

module.exports = router;