const express = require('express');
const router = express.Router();
const MetaAccount = require('../model/MT4account');
const auth = require('../middleware/auth1.middleware');

// Add new MetaTrader account
router.post('/account', auth, async (req, res) => {
  try {
    const { accountNumber, broker, server, password, platform } = req.body;
    
    const account = new MetaAccount({
      userId: req.user.id,
      accountNumber,
      broker,
      server,
      password, // Note: In production, encrypt this
      platform
    });
    
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's accounts
router.get('/get', auth, async (req, res) => {
  try {
    const accounts = await MetaAccount.find({ userId: req.user.id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { createAccount, getAllAccounts, getAccountById, updateAccount, deleteAccount } = require("../controller/account.controller");

// // Routes
// router.post("/createAccount",createAccount); 
// router.get("/getAllAccounts", getAllAccounts); 
// router.get("/getAccountById", getAccountById); 
// router.put("/updateAccount", updateAccount); 
// router.delete("/deleteAccount", deleteAccount); 

// module.exports = router;