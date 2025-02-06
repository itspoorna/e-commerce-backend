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
    unique: true,
    default: "https://tse1.mm.bing.net/th?id=OIP.HHi_sftNfoBzFhGvC3BalwHaDR&pid=Api&P=0&h=180" 
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the vendor
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for discount
productSchema.virtual('discount').get(function() {
  return this._discount;
}).set(function(value) {
  this._discount = value;
});

// Virtual field for newPrice
productSchema.virtual('newPrice').get(function() {
  if (this.price && this._discount) {
    return Math.round((this.price - (this.price * (this._discount / 100))) * 100) / 100;
  }
  return this.price;
});

// Pre-save hook to calculate the new price based on discount
productSchema.pre('save', function(next) {
  if (this.price && this._discount) {
    this.newPrice = this.price - (this.price * (this._discount / 100));
  }
  next();
});

// Pre-findOneAndUpdate hook to calculate the new price based on discount
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.price !== undefined || update._discount !== undefined) {
    const price = update.price !== undefined ? update.price : this._update.$set.price;
    const discount = update._discount !== undefined ? update._discount : this._update.$set._discount;
    if (price && discount !== undefined) {
      update.newPrice = price - (price * (discount / 100));
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
