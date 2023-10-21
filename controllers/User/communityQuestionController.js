const CommunityQuestion = require("./../../models/User/communityQuestionModel");
const CommunityQuestionComment = require("./../../models/User/communityQuestionCommentModel");
const { sendNotification } = require("../../controllers/User/fireBaseAuth");

const User = require("./../../models/User/userModel");
const UserMatch = require("../../models/User/userMatchModel");
exports.createQuestion = async (req, res) => {
  try {
    const { question, userId } = req.body;
    const user = await User.findById(userId);
    const questionData = await CommunityQuestion.create({
      question,
      user: user._id,
    });

    res.status(201).json({
      status: "created",
      message: "Question created successfully",
      question: questionData,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};

exports.commentOnQuestion = async (req, res) => {
  try {
    const { questionId, comment, userId } = req.body;
    const user = await User.findById(userId);
    const question = await CommunityQuestion.findById(questionId);
    const commentData = await CommunityQuestionComment.create({
      comment,
      user: user._id,
    });
    question.comment.push(commentData._id);
    question.save();
    const questionUser = await User.findById(question.user);

    sendNotification(
      "Notification from nectar",
      `${user.name} has replied to you question`,
      questionUser.notificationsToken,
      {
        route: "/dashboard?index=1",
      }
    );

    res.status(200).json({
      status: "success",
      message: "Question comment successfully",
      comment: commentData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};

exports.likeOnCommentOfQuestion = async (req, res) => {
  try {
    const { commentId, userId } = req.body;
    const user = await User.findById(userId);
    const comment = await CommunityQuestionComment.findById(commentId);

    comment.like.push(user._id);
    comment.save();

    res.status(200).json({
      status: "success",
      message: "comment like  successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};

exports.getUserQuestion = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const question = await CommunityQuestion.find({ user: user.id }).populate({
      path: "comment",
      options: {
        limit: 10,
        sort: { created: -1 },
      },
    });

    res.status(200).json({
      status: "created",
      message: "successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};

exports.getQuestionByLimit = async (req, res) => {
  try {
    const { limit, page } = req.params;
    const skip = page * limit - limit;
    const question = await CommunityQuestion.find()
      .limit(limit)
      .skip(skip)
      .sort({ created: -1 })
      .populate({
        path: "comment",
        options: {
          limit: 10,
          sort: { created: -1 },
        },
      });

    res.status(200).json({
      status: "success",
      message: "successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};

exports.searchCommunityQuestion = async (req, res) => {
  try {
    if (req.params.query.length > 2) {
      const question = await CommunityQuestion.find({
        $or: [{ question: { $regex: req.params.query } }],
      })
        .limit(20)
        .populate({
          path: "comment",
          options: {
            limit: 10,
            sort: { created: -1 },
          },
        });

      res
        .status(200)
        .json({ status: "success", message: "successfully", question });
    } else {
      res.status(200).json({ status: "success", message: "enter more text " });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getQuestionCommentByLimit = async (req, res) => {
  try {
    const { limit, page } = req.params;
    const skip = page * limit - limit;
    const question = await CommunityQuestion.findById(
      req.params.questionId
    ).populate({
      path: "comment",
      options: {
        limit: limit,
        skip: skip,
        sort: { created: -1 },
      },
    });

    res.status(200).json({
      status: "success",
      message: "successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "internal server error" });
  }
};
