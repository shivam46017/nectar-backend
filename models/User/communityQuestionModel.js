const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const communityQuestionSchema = new mongoose.Schema(
  {
    like: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: Schema.ObjectId,
      ref: "User",
    },

    comment: [
      {
        type: Schema.ObjectId,
        ref: "communityQuestionComment",
      },
    ],
    question: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityQuestion = mongoose.model(
  "communityQuestion",
  communityQuestionSchema
);

module.exports = CommunityQuestion;
