const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Client = require("../model/client");
const upload =require ("../middleware/clientphoto.middleware");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
require("dotenv").config();

const registerClient = async (req, res) => {
  try {
    const { name, email, mobileNumber, username, password } = req.body;

    // Check if email or username already exists
    const existingClient = await Client.findOne({ $or: [{ email }, { username }] });
    if (existingClient) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete uploaded image if user already exists
      }
      return res.status(400).json({ message: "Email or Username already exists", success: false });
    }

    // Set profile photo if uploaded, otherwise set null
    const profilePhoto = req.file ? `/photo/clientphoto/${req.file.filename}` : null;

    // Create new client
    const newClient = new Client({
      name,
      email,
      mobileNumber,
      username,
      profilePhoto, 
      password,
      role: "client",
      isActive: true,
      isDelete: false,
    });

    await newClient.save();

    res.status(201).json({
      message: "Client Registered Successfully",
      success: true,
      client: newClient,
    });
  } catch (error) {
    console.error("Error registering client:", error);

    // If any error occurs and a file exists, delete the uploaded image
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "Server Error", success: false, error: error.message });
  }
};

const clientLogin = async (req, res) => {
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

    // Check if client exists
    const client = await Client.findOne({ username });
    if (!client) {
      return res.status(401).json({ message: "User not found", success: false });
    }

    // Prevent login if client is deleted
    if (client.isDelete) {
      return res.status(403).json({ message: "Your account has been deleted", success: false });
    }

    // Prevent login if client is inactive
    if (!client.isActive) {
      return res.status(403).json({ message: "Your account is inactive. Please contact support.", success: false });
    }

    // Validate password (without bcrypt)
    if (client.password !== password) {
      return res.status(403).json({ message: "Invalid Username or Password", success: false });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: client._id,
        username: client.username,
        role: client.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    res.status(200).json({
      userType: "client",
      token,
      message: "Login successful",
      success: true,
    });
  } catch (err) {
    console.error("Error logging in client:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

const getClientProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID is missing from token" });
    }

    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({ isDelete: false }).select("-password");
    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateClientProfile = async (req, res) => {
  try {
    const {  newPassword } = req.body;
    const profilePhoto = req.file ? `/photo/clientphoto/${req.file.filename}` : null;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
    }

    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

     // Delete old profile photo if new one is uploaded
     if (profilePhoto && client.profilePhoto) {
      const oldImagePath = path.join(__dirname, "..", client.profilePhoto);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update fields
    // if (name) client.name = name;
    // if (mobileNumber) client.mobileNumber = mobileNumber;
    if (newPassword) client.password = newPassword;
    if (profilePhoto) client.profilePhoto = profilePhoto;

    await client.save();

    return res.status(200).json({
      success: true, 
      message: "Profile updated successfully",
      client: {
        id: client._id,
        // name: client.name,
        // mobileNumber: client.mobileNumber,
        profilePhoto: client.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateClientStatus = async (req, res) => {
  try {
    let { id, isActive } = req.body;

    // console.log("Received Data:", { id, isActive }); // Debugging

    // Ensure only admins can update status
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    // Validate Client ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Client ID" });
    }

    // If `isActive` is undefined, return an error
    if (typeof isActive === "undefined") {
      return res.status(400).json({ success: false, message: "Missing isActive field" });
    }

    // Convert isActive to Boolean explicitly
    isActive = Boolean(isActive);

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Client status updated successfully",
      client: {
        id: updatedClient._id,
        name: updatedClient.name,
        isActive: updatedClient.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating client status:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateClientDeleteStatus = async (req, res) => {
  try {
    let { id, isDelete } = req.body;

    // Ensure only admins can update delete status
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    // Validate Client ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Client ID" });
    }

    // If `isDelete` is undefined, return an error
    if (typeof isDelete === "undefined") {
      return res.status(400).json({ success: false, message: "Missing isDelete field" });
    }

    // Convert isDelete to Boolean explicitly
    isDelete = Boolean(isDelete);

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { isDelete },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Client delete status updated successfully",
      client: {
        id: updatedClient._id,
        name: updatedClient.name,
        isDelete: updatedClient.isDelete,
      },
    });
  } catch (error) {
    console.error("Error updating client delete status:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getDeletedClients = async (req, res) => {
  try {
    // Ensure only admins can access deleted clients
    if (!req.user || req.user.role !== "admin") {
      console.log(req.user);
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    // Fetch all clients where isDelete is true
    const deletedClients = await Client.find({ isDelete: true });

    if (deletedClients.length === 0) {
      return res.status(404).json({ success: false, message: "No deleted clients found" });
    }

    return res.status(200).json({
      success: true,
      message: "Deleted clients retrieved successfully",
      clients: deletedClients,
    });
  } catch (error) {
    console.error("Error fetching deleted clients:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// const updateClientProfile = async (req, res) => {
//   try {
//     const { name, mobileNumber, password, newPassword } = req.body;

//     // Find client
//     const client = await Client.findById(req.user.id);
//     // console.log(req.user.id);
//     if (!client) {
//       return res.status(404).json({ message: "Client not found" });
//     }

//     // Handle password update if provided
//     if (password && newPassword) {
//       const isMatch = await bcrypt.compare(password, client.password);
//       if (!isMatch) {
//         return res.status(400).json({ message: "Current password is incorrect" });
//       }

//       // Hash new password
//       const salt = await bcrypt.genSalt(10);
//       client.password = await bcrypt.hash(newPassword, salt);
//     }

//     // Update fields
//     client.name = name || client.name;
//     client.mobileNumber = mobileNumber || client.mobileNumber;

//     // If profile photo is uploaded, update it
//     if (req.file) {
//       client.profilePhoto = `/photo/clientphoto/${req.file.filename}`;
//     }

//     await client.save();

//     res.json({ message: "Profile Updated Successfully", client });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };



module.exports = { 
  clientLogin , 
  registerClient , 
  updateClientProfile , 
  getClientProfile ,
  getAllClients, 
  updateClientStatus,
  updateClientDeleteStatus,
  getDeletedClients
}
