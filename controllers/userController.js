const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user'); 
const { authenticateAdmin } = require('../middleware/authenticateToken'); // Adjust the path as necessary

// Get all users
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Error fetching user');
  }
});

// Create a new user
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { username, emailId, password, role, mobileNo } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Generate a random password if not provided
    const userPassword = password || crypto.randomBytes(8).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create a new user
    const newUser = new User({
      username,
      emailId,
      password: hashedPassword,
      role : role || 'staff',
      mobileNo
    });

    // Save the new user
    await newUser.save();

    res.status(201).json({ user: newUser, password: userPassword });
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { username, emailId, password, role, mobileNo } = req.body;

    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update user fields
    user.username = username || user.username;
    user.emailId = emailId || user.emailId;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;
    user.role = role || user.role;
    user.mobileNo = mobileNo || user.mobileNo;

    // Save the updated user
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Error updating user');
  }
});

// Delete a user
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
});

module.exports = router;