const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema(
  {
    // Token For is the Value for the Token Generator Like:(Video Calling, Live Steaming, and Messaging App)
    validity: {
      type: String,
      enum: ["Valid", "Expire"],
      default: "Valid",
    },
    videoCallStatus: {
      type: String,
      enum: [
        "Waiting",
        "Answered",
        "DeclinedByFrom",
        "DeclinedByTo",
        "Ended",
        "Missed",
      ],
      default: "Waiting",
    },
    callFromUid: {
      type: Number,
    },
    callToUid: {
      type: Number,
    },
    chanelName: {
      type: String,
    },
    callFromToken: {
      type: String,
    },
    callToToken: {
      type: String,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const VideoCall = mongoose.model("VideoCall", videoCallSchema);

module.exports = VideoCall;
