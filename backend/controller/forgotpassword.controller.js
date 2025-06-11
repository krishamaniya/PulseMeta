const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Admin = require("../model/admin");
const Client = require("../model/client");
require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:"webmintinfotech@gmail.com",
    pass:"umnl lrxw croi rlqt",
  },
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user in both Admin & Client collections
    const admin = await Admin.findOne({ email });
    const client = await Client.findOne({ email });

    const user = admin || client;
    const role = admin ? "admin" : "client";

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate Reset Token (valid for 15 minutes)
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Reset Password Link
    const resetLink = `http://localhost:3000/resetpasswordform/${token}`;

    const mailOptions = {
      from:"webmintinfotech@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `<p style="font-size: 16px; color: black;">
      Click <a href="${resetLink}" style="font-size: 16px; color: blue; font-weight: bold;">
      here</a> to reset your password.
    </p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Reset password link sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Verify Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const { id, role } = decoded;

    // Find User
    let user;
    if (role === "admin") {
      user = await Admin.findById(id);
    } else {
      user = await Client.findById(id);
    }

    if (!user) {
      console.error("User not found with ID:", id);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update Password (Without bcrypt)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);  // Detailed logging
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = { 
  forgotPassword,
  resetPassword
}
