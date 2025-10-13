const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Save user after Firebase login
router.post("/", async (req, res) => {
  const { uid, email } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ message: "UID and email are required." });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email });
      await user.save();
    }

    res.status(200).json({ message: "User stored successfully.", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

