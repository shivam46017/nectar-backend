const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
    },
    transaction: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    transactionCompleted: {
      type: Boolean,
      default: false,
    },
    transactionAmount: {
      type: Number,
    },
    clientSecretKey: {
      type: String,
    },
    transactionStatus: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending",
    },
    plainType: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "semiyearly", "yearly"],
    },
    planExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
