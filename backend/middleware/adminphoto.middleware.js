const multer = require("multer");
const path = require("path");

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "photo/adminphoto"); // Set the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  },
});

// Filter only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Initialize Multer with storage and file filter
const upload = multer({ storage, fileFilter });

module.exports = upload;



// const multer = require("multer");

// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "photo/adminphoto"); // Set the destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     // Set the filename for the uploaded file
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Initialize multer with the configured storage
// const upload = multer({ storage: storage });

// // const multipleupload = upload.fields([{}])

// module.exports = upload;
