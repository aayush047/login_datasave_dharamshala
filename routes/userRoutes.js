const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new user
router.post('/', async (req, res) => {
  const { uid, email } = req.body;
  const user = new User({ uid, email });
  try {
    const savedUser = await user.save();
    res.status(201).json({ message: 'User stored successfully.', user: savedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
