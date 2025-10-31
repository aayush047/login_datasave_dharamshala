// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // GET all users
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // POST a new user
// router.post('/', async (req, res) => {
//   const { uid, email } = req.body;
//   const user = new User({ uid, email });
//   try {
//     const savedUser = await user.save();
//     res.status(201).json({ message: 'User stored successfully.', user: savedUser });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Playtest credentials (dummy)
const PLAYTEST_EMAIL = 'playtest@gmail.com';
const PLAYTEST_PASSWORD = 'play@test';
const SALT_ROUNDS = 10;

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
// NOTE: this route still accepts { uid, email } for regular users.
// If the request contains the Play Store test credentials (email + password),
// it will create/update a special test user with a hashed password and isPlayTester flag.
// Real users continue to be created as before if they don't send the playtest credentials.
router.post('/', async (req, res) => {
  const { uid, email, password } = req.body;

  try {
    // If Play Store test account credentials are present and match
    if (email === PLAYTEST_EMAIL && password === PLAYTEST_PASSWORD) {
      // find existing test user by email (or uid) and update password + flag
      let user = await User.findOne({ email: PLAYTEST_EMAIL });

      // hash the test password before storing
      const hashed = await bcrypt.hash(PLAYTEST_PASSWORD, SALT_ROUNDS);

      if (user) {
        user.password = hashed;
        user.isPlayTester = true;
        // ensure uid exists (optional)
        if (!user.uid) user.uid = uid || 'playtest-uid';
        const updated = await user.save();
        // do not send password back
        const { password: _, ...safe } = updated.toObject ? updated.toObject() : updated;
        return res.status(200).json({ message: 'Playtest user updated.', user: safe });
      } else {
        // create new playtest user
        const newUser = new User({
          uid: uid || 'playtest-uid',
          email: PLAYTEST_EMAIL,
          password: hashed,
          isPlayTester: true
        });
        const savedUser = await newUser.save();
        const { password: _, ...safe } = savedUser.toObject ? savedUser.toObject() : savedUser;
        return res.status(201).json({ message: 'Playtest user created.', user: safe });
      }
    }

    // Regular user flow: keep as-is (only uid and email)
    const user = new User({ uid, email });
    const savedUser = await user.save();
    res.status(201).json({ message: 'User stored successfully.', user: savedUser });
  } catch (error) {
    // Handle errors for both playtest and regular flows
    res.status(400).json({ message: error.message });
  }
});


// 🔹 DELETE user by UID
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const deletedUser = await User.findOneAndDelete({ uid });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
