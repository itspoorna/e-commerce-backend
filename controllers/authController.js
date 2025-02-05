const express = require('express');
const router = express.Router();
const User = require('../module/user'); // Import the User model
const bcrypt = require('bcrypt'); // For password hashing

// Sample route for user login
router.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }

    // If login is successful
    res.status(200).send('User logged in successfully');
  } catch (error) {
    res.status(500).send('Error logging in user');
  }
});

// Sample route for user registration
router.post('/register', async (req, res) => {
  try {
    const { username, emailId, password, role, mobileNo } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      emailId,
      password: hashedPassword,
      role,
      mobileNo
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

module.exports = router;