// const mongoose = require("mongoose");

// const clientSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   },
//   mobileNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     validate: {
//       validator: function(v) {
//         return /^[0-9]{10,15}$/.test(v);
//       },
//       message: props => `${props.value} is not a valid phone number!`
//     }
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     minlength: 4
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   profilePhoto: {
//     type: String,
//     default: null
//   },
//   role: {
//     type: String,
//     default: "client",
//     enum: ["client", "admin"] // restricts to these values
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isDelete: {
//     type: Boolean,
//     default: false
//   },
//   mt5Accounts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'MT5Connection'
//   }]
// }, { 
//   timestamps: true,
//   toJSON: {
//     virtuals: true,
//     transform: function(doc, ret) {
//       delete ret.password; // Never return password in queries
//       return ret;
//     }
//   }
// });

// // Add indexes
// clientSchema.index({ email: 1 });
// clientSchema.index({ username: 1 });
// clientSchema.index({ mobileNumber: 1 });

// const Client = mongoose.model("Client", clientSchema);
// module.exports = Client;

const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: null, 
    require:false,
  },
  role: {
    type: String,
    default: "client", 
  },
  isActive: {
    type: Boolean,
    default: true, // Admin is active by default
  },
  isDelete: {
    type: Boolean,
    default: false, // Soft delete flag
  }
  
}, { timestamps: true }); 

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
