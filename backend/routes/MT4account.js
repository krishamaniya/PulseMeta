const express = require('express');
const MTAccount = require('../model/MT4account');
const authMiddleware = require('../middleware/auth1.middleware'); // Checks JWT token
const router = express.Router();

// Add MT account for authenticated user
router.post('/add', authMiddleware, async (req,res) => {
  try {
    const { accountNumber, login, password, server, platform } = req.body;
    // (Optional) Encrypt password before saving for security
    const mtAccount = new MTAccount({
      user: req.user.id,
      accountNumber, login, password, server, platform
    });
    await mtAccount.save();
    res.json({ message: 'MT account added', mtAccount });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// List MT accounts of user
router.get('/', authMiddleware, async (req,res) => {
  const accounts = await MTAccount.find({ user: req.user.id });
  res.json(accounts);
});

module.exports = router;