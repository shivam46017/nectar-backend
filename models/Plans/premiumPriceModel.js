const mongoose = require("mongoose");

const premiumPriceSchema = new mongoose.Schema({
  premium: {
    type: String,
    required: true,
    default: "premium",
    emit: ["premium"],
    unique: true,
  },
  weekly: {
    type: Number,
    require: true,
  },
  monthly: {
    type: Number,
    require: true,
  },
  quaterly: {
    type: Number,
    require: true,
  },
  semiyearly: {
    type: Number,
    require: true,
  },
  yearly: {
    type: Number,
    require: true,
  },
});

const PremiumPrice = mongoose.model("premiumPrice", premiumPriceSchema);

module.exports = PremiumPrice;
