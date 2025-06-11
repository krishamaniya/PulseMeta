  const mongoose = require("mongoose");

  const mt5ConnectionSchema = new mongoose.Schema({
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client"
    },
    user: String,
    password: String,
    server: String,
    connectId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = mongoose.model("MT5Connection", mt5ConnectionSchema);


// const mongoose = require("mongoose");

// const mt5ConnectionSchema = new mongoose.Schema({
//   user: String,
//   password: String,
//   server: String,
//   connectId: String,
//   isDeleted: { type: Boolean, default: false },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("MT5Connection", mt5ConnectionSchema);
