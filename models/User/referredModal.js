const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const referredSchema = new mongoose.Schema(
  {
    referredBy: {
      type: Schema.ObjectId,
      ref: "User",
    },
    refererTo: {
      type: String,
    },
    referredUser: {
      type: Schema.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Referred = mongoose.model("Referred", referredSchema);

module.exports = Referred;
