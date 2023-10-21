const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const communityQuestionCommentSchema = new mongoose.Schema(
  {
    like: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],

    comment: {
      type: String,
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const CommunityQuestionComment = mongoose.model(
  "communityQuestionComment",
  communityQuestionCommentSchema
);

module.exports = CommunityQuestionComment;
