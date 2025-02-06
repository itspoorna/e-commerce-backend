require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces body-parser

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/e-comdb";

const connectDB = async () => {
  try {
    await connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Import controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController'); 

// Use controllers
app.use('/api/auth', authController);
app.use('/api/products', productController);
app.use('/api/users', userController); 

// Sample Route
app.get('/', (req, res) => {
  res.send('Express Server Running!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
