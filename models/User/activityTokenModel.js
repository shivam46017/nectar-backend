const mongoose = require("mongoose");

const activityTokenModel = new mongoose.Schema(
  {
    // Token For is the Value for the Token Generator Like:(Video Calling, Live Steaming, and Messaging App)
    typeOf: {
      type: String,
      enum: ["videoCall", "liveStream", "rtm"],
    },
    validity: {
      type: String,
      enum: ["Valid", "Expire"],
      default: "Valid",
    },
    liveStreamWaiting: {
      type: Boolean,
      default: false,
    },
    videoCallWaitingAnswer: {
      type: Boolean,
      default: false,
    },
    publisherUid: {
      type: Number,
    },
    subscriberUid: {
      type: Number,
    },
    chanelName: {
      type: String,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publisherToken: {
      type: String,
      require: true,
    },
    subscriberToken: {
      type: String,
    },
    // liveTokenList: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

const ActivityToken = mongoose.model("activityToken", activityTokenModel);

module.exports = ActivityToken;
