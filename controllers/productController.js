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

    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        discount: req.body.discount,
        startDate: req.body.startDate,
        expiryDate: req.body.expiryDate,
        imageUrl: req.body.imageUrl
      },
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

    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;