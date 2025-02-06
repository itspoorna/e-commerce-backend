const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { 
    type: Number, 
    required: true,
    set: v => Math.round(v * 100) / 100 // Ensure price is stored with 2 decimal places
  },
  newPrice: { 
    type: Number,
    set: v => Math.round(v * 100) / 100 // Ensure newPrice is stored with 2 decimal places
  },
  discount: { type: Number, default: 0 }, 
  startDate: { type: Date, required: true, default: Date.now },
  expiryDate: { 
    type: Date, 
    required: true, 
    default: () => {
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 7));
    }
  },
  imageUrl: { 
    type: String, 
    required: true, 
    default: "https://tse1.mm.bing.net/th?id=OIP.HHi_sftNfoBzFhGvC3BalwHaDR&pid=Api&P=0&h=180" 
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the vendor
});

// Pre-save hook to calculate the new price based on discount
productSchema.pre('save', function(next) {
  if (this.price && this.discount) {
    this.newPrice = this.price - (this.price * (this.discount / 100));
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
