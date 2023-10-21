const mongoose = require("mongoose");
const helpQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const HelpQuestion = mongoose.model("HelpQuestion", helpQuestionSchema);

module.exports = HelpQuestion;
