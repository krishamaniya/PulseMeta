const mongoose = require('mongoose');

const MT5ProfileSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: false,
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MT5Connection",
    required: false,
  },
  connectId: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: false },
  name: { type: String },
  server: { type: String },
  profit: Number,
  balance: Number,
  equity: Number,
  margin: Number,
  freeMargin: Number,
  credit: Number,
  marginLevel: Number,
  openedOrders: { type: Array, default: [] },
  updateType: { type: String, enum: ['api', 'manual'], default: 'api' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MT5Profile', MT5ProfileSchema);


// const mongoose = require('mongoose');

// const MT5ProfileSchema = new mongoose.Schema({
//   connectId: { type: String, required: true, unique: true },
//   profit: Number,
//   balance: Number,
//   equity: Number,
//   margin: Number,
//   freeMargin: Number,
//   credit: Number,
//   marginLevel: Number,
//   openedOrders: { type: Array, default: [] },
//   updateType: String,
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('MT5Profile', MT5ProfileSchema);


