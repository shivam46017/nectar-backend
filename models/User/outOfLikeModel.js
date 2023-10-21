const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const outOfLikeSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
    },
    remainingLike: {
      type: Number,
    },
    todayDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const OutOfLike = mongoose.model("OutOfLike", outOfLikeSchema);

module.exports = OutOfLike;
