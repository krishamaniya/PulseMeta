const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  broker: {
    type: String,
    required: true,
    unique: true
  },
  servers: {
    type: [String],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Server', serverSchema);