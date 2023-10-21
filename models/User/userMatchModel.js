const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const userMatchSchema = new mongoose.Schema(
  {
    likeUser: {
      type: Schema.ObjectId,
      ref: "User",
    },
    expireTime: {
      type: Date,
    },
    startTime: {
      type: String,
      type: Date,
      default: new Date(Date.now()),
    },
    likedUser: {
      type: Schema.ObjectId,
      ref: "User",
    },
    match: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserMatch = mongoose.model("userMatch", userMatchSchema);

module.exports = UserMatch;
