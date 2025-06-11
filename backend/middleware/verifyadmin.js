const jwt = require("jsonwebtoken");
const Admin = require("../model/admin");

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization"); // Get token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Admin Token:", decoded); 
    // console.log("JWT Secret in verifyAdmin:", process.env.JWT_SECRET);

    // Use `decoded.id` instead of `decoded.user.id`
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Attach admin details to request
    req.user = admin;
    next();
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAdmin;
