// // middleware/auth.middleware.js
// const jwt = require("jsonwebtoken");

// const authenticateUser = (req, res, next) => {
//   try {
//     const token = req.header("Authorization");
//     if (!token) {
//       return res.status(401).json({ message: "Access Denied. No token provided.", success: false });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: "Invalid or Expired Token", success: false });
//   }
// };

// module.exports = authenticateUser;

const jwt = require("jsonwebtoken");
const Client = require("../model/client");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await Client.findById(decoded.id); // assuming your JWT contains { id: client._id }

    if (!client) {
      return res.status(401).json({ message: "Invalid token: Client not found" });
    }

    req.client = client; // Attach the logged-in client
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = authenticateUser;




// const jwt = require("jsonwebtoken");

// const authenticateUser = (req, res, next) => {
//   try {
//     const token = req.header("Authorization");
//     if (!token) {
//       return res.status(401).json({ message: "Access Denied. No token provided.", success: false });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user details to request
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: "Invalid or Expired Token", success: false });
//   }
// };

// module.exports = { authenticateUser };


// Middleware to authorize only admins
// const authorizeAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access Denied. Only Admins are allowed.", success: false });
//   }
//   next();
// };

