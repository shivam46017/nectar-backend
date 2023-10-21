const mongoose = require("mongoose");
const userPhotoSchema = new mongoose.Schema({
  photoPath: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  viewability: {
    type: String,
    default: "public",
  },
  like: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  disLike: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

const UserPhoto = mongoose.model("UserPhoto", userPhotoSchema);

module.exports = UserPhoto;
