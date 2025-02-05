const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  emailId: { type: String, required: true },
  mobileNo: { type: String },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
