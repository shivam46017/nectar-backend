const mongoose = require("mongoose");
const userOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    phone: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const UserOTP = mongoose.model("UserOTP", userOtpSchema);

module.exports = UserOTP;
