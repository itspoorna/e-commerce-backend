const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  oldPrice: { type: Number },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  imageUrl: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
