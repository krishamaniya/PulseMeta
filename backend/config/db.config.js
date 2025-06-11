const mongoose = require("mongoose");

const URL = process.env.MONGO_DB_URL;

const connect_to_db = () => {
  mongoose.connect(URL).then(() => console.log("db connected."));
};

module.exports = connect_to_db;

// const mongoose = require("mongoose");

// const URL = process.env.MONGO_DB_URL;

// const connect_to_db = async () => {
//   try {
//     await mongoose.connect(URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       // replicaSet: 'rs0', // Replace 'rs0' with your actual replica set name
//     });
//     console.log("Database connected successfully.");
//   } catch (error) {
//     console.error("Database connection failed:", error.message);
//     process.exit(1); // Exit process with failure
//   }
// };

// module.exports = connect_to_db;


// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000,  // Fail fast if no connection
//   socketTimeoutMS: 45000          // Keep trying for 45 seconds
// })
// .then(() => console.log('MongoDB connected successfully'))
// .catch(err => {
//   console.error('MongoDB connection error:', err);
//   process.exit(1);  // Exit if no DB connection
// });

