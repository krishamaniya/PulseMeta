const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
    trim: true,
  },
  mobileNo: {
    type: String,
    required: true,
    // unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    // unique: true,
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: null, 
    require:false,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin"], // Admin role only
    default: "admin",
  },
  isActive: {
    type: Boolean,
    default: true, // Admin is active by default
  },
  isDelete: {
    type: Boolean,
    default: false, // Soft delete flag
  },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
