const mongoose = require('mongoose');
const { Schema } = mongoose
const User = require("./users")

const forgotPasswordSchema = new Schema({
  // Other fields related to the forgot password process

  created_at: {
    type: Date,
    default: Date.now,
  },

  otp: {
    type: Number,
    required: true, // You can adjust the validation as needed
  },

  user_email: {
    type: String,
    ref: User, // Reference the 'User' model
  },
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);
