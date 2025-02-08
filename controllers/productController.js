const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Assuming you have a Product model
const User = require('../models/user'); // Assuming you have a User model
const { authenticateToken } = require('../middleware/authenticateToken'); // Adjust the path as necessary

// Route to get all products with search and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(search, 'i');

    // Find products with search criteria
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    })
    .populate('vendor', 'username emailId role')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    // Get total documents count
    const count = await Product.countDocuments({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    });

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get a specific product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'username emailId role');
    if (product == null) {
      return res.status(404).json({ message: 'Cannot find product' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to create a new product
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role === 'user') {
    try {
      const user = await User.findById(req.user.id);
      user.role = 'vendor';
      await user.save();
      req.user.role = 'vendor';
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    discount: req.body.discount,
    startDate: req.body.startDate,
    expiryDate: req.body.expiryDate,
    imageUrl: req.body.imageUrl,
    vendor: req.user.id // Associate product with the vendor
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to update a specific product by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Cannot find product' });
    }

    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    const updateFields = {};
    if (req.body.name != null) updateFields.name = req.body.name;
    if (req.body.description != null) updateFields.description = req.body.description;
    if (req.body.category != null) updateFields.category = req.body.category;
    if (req.body.price != null) updateFields.price = req.body.price;
    if (req.body.discount != null) updateFields.discount = req.body.discount;
    if (req.body.startDate != null) updateFields.startDate = req.body.startDate;
    if (req.body.expiryDate != null) updateFields.expiryDate = req.body.expiryDate;
    if (req.body.imageUrl != null) updateFields.imageUrl = req.body.imageUrl;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to delete a specific product by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Cannot find product' });
    }

    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;