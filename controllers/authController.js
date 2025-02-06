const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust the path as necessary

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

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, emailId: user.emailId, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // If login is successful, send the token
    res.status(200).json({ message: 'User logged in successfully', token });
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

    // Save the new user
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

module.exports = router;