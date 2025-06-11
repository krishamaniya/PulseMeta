const jwt = require("jsonwebtoken");
const Client = require("../model/client");

const verifyClient = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]; // Get token from headers

    if (!token) {
      return res.status(401).json({ message: "Token not provided", success: false });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ message: "Invalid token", success: false });
    }

    req.user = decoded;
    // console.log(req.user);

    const userData = await Client.findById(req.user.id);
    // console.log(userData);
    if (!userData) {
      return res.status(400).json({ message: "Client not found", success: false });
    }

    if (!userData.isActive) {
      return res.status(405).json({ message: "Your Account is Locked", success: false });
    }

    next();
  } catch (err) {
    console.error("Error verifying client:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

module.exports = verifyClient;
