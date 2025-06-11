const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  symbol: String,
  type: String,
  volume: Number,
  price: Number,
  sl: Number,
  tp: Number,
  profit: Number,
  orderId: Number,
  openTime: Date,
}, { _id: false });

const orderHistorySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  account: String,
  orders: [orderSchema]
}, { timestamps: true });

module.exports = mongoose.model('OrderHistory', orderHistorySchema);


// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   symbol: String,
//   type: String,
//   volume: Number,
//   price: Number,
//   sl: Number,
//   tp: Number,
//   profit: Number,
//   orderId: Number,
//   openTime: Date,
// }, { _id: false });

// const orderHistorySchema = new mongoose.Schema({
//   account: String,
//   orders: [orderSchema]
// }, { timestamps: true });

// module.exports = mongoose.model('OrderHistory', orderHistorySchema);
