const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try{
    const {username,email,password} = req.body;
    const user = new User({username,email,password});
    await user.save();
    res.json({message: 'User registered'});
  } catch(err){
    res.status(400).json({error: err.message});
  }
});

// Login
router.post('/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({error: 'User not found'});
    // const isMatch = await user.comparePassword(password);
    // if(!isMatch) return res.status(400).json({error:'Invalid password'});
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
    res.json({token, username: user.username});
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;