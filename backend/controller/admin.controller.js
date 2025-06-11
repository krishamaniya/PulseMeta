const jwt = require("jsonwebtoken");
const fs = require("fs"); // Import file system module
const path = require("path");
const { validationResult } = require("express-validator");
const Admin = require("../model/admin");
const upload = require("../middleware/adminphoto.middleware");

const adminLogin = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "User login failed.",
        success: false,
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "User not found", success: false });
    }

    // Validate password (without bcrypt)
    if (admin.password !== password) {
      return res.status(403).json({ message: "Invalid Username or Password", success: false });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, 
        username: admin.username, 
        role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // console.log("Generated Token:", token); 
    // console.log("JWT Secret in Login:", process.env.JWT_SECRET);

    res.status(200).json({
      userType: "admin",
      token,
      message: "Login successful",
      success: true,
    });
  } catch (err) {
    console.error("Error logging in admin:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

const createAdminProfile = async (req, res) => {
  try {
    const { name, email, mobileNo, username, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required", success: false });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {

      // If user exists, delete the uploaded image
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Email or Username already exists", success: false });
    }

    // Save profile photo path
    const profilePhoto = `/uploads/adminphoto/${req.file.filename}`;

    const newAdmin = new Admin({
      name,
      email,
      mobileNo,
      username,
      profilePhoto,
      password,
      role: "admin",
      isActive: true,
      isDelete: false,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin Profile Created Successfully",
      success: true,
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error creating admin profile:", error);

    //If any error occurs and file exists, delete the uploaded image
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "Server Error", success: false, error: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID is missing from token" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const profilePhoto = req.file ? `/photo/adminphoto/${req.file.filename}` : null;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin ID missing" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Update fields
    if (newPassword) admin.password = newPassword;
    if (profilePhoto) admin.profilePhoto = profilePhoto;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        profilePhoto: admin.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Admin Profile Update Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.body.id;
    
    const admin = await Admin.findByIdAndUpdate(adminId, { isDelete: true }, { new: true });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }
    
    res.status(200).json({ message: "Admin deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Server Error", success: false, error: error.message });
  }
};

module.exports = { adminLogin, createAdminProfile, getAdminProfile, updateAdminProfile, deleteAdmin };


