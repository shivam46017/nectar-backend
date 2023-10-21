const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const crashSchema = new Schema({
  message: {
    type: String,
  },
  deviceInfo: {
    type: {},
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("crash", crashSchema);
