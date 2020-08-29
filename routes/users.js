const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const User = require('../models/User');

// @route    POST api/users
// @desc     Register a user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      // check to see if user with email exists
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      // set user to new User if email does not already exist
      user = new User({
        name,
        email,
        password,
      });
      // before saving to db, hash password via bcrypt
      const salt = await bcrypt.genSalt(10);
      // hash the password
      user.password = await bcrypt.hash(password, salt);
      // save to db
      await user.save();

      res.send('user saved');
    } catch (error) {
      console.error(error.message);
      res.send(500).send('Server error');
    }
  }
);

module.exports = router;
