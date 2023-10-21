//
const User = require("./../../../models/User/userModel");
const { sendNotification } = require("../../User/fireBaseAuth");
const UserMatch = require("../../../models/User/userMatchModel");
const CommunityQuestion = require("../../../models/User/communityQuestionModel");
const CommunityQuestionComment = require("../../../models/User/communityQuestionCommentModel");
const Referred = require("../../../models/User/referredModal");
const Transaction = require("../../../models/User/transactionModel");
const HelpQuestion = require("../../../models/User/helpQuestionModel");
exports.getallUserWithLimit = async (req, res) => {
  try {
    const { limit, page } = req.params;
    const skip = page * limit - limit;
    const user = await User.find().sort({ _id: -1 }).skip(skip).limit(limit);
    const totalUser = await User.count();
    res.status(200).json({
      status: "success",
      totalUser,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

exports.getallUserToAproveWithLimit = async (req, res) => {
  try {
    const { limit, page } = req.params;
    const skip = page * limit - limit;
    const user = await User.find({ userVerifyed: false })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const totalUser = await User.find({ userVerifyed: false }).count();
    res.status(200).json({
      status: "success",
      totalUser,
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

exports.userNotificationSendForReUpload = async (req, res) => {
  try {
    const { id, selfieVerify, fullBodyVerify, videoBioVerifyed } = req.body;
    const user = await User.findById(id);
    if (user) {
      if (!selfieVerify || !fullBodyVerify) {
        // console.log("notification sended mgs = reload Selfie");
        sendNotification(
          "Oh No 💔 !!!! ",
          "Nectar isn't satisfied by the photos you uploaded",
          user.notificationsToken,
          {
            route: "/gettingStarted",
          }
        );
      }

      if (!videoBioVerifyed) {
        console.log("notification sended mgs = reload videoBio");
        sendNotification(
          "Oh No 💔 !!!! ",
          "Nectar isn't satisfied by the video bio you uploaded",
          user.notificationsToken,
          {
            route: "/gettingStarted",
          }
        );
      }

      user.selfieVerify = selfieVerify;
      user.fullBodyVerify = fullBodyVerify;
      user.videoBioVerifyed = videoBioVerifyed;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "Notification sended to user",
        user,
      });
    } else {
      res.status(404).json({
        status: "Not Found",
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

exports.userFinalApproval = async (req, res) => {
  try {
    console.log("userFinalApproval")
    const { id, selfieVerify, fullBodyVerify, videoBioVerifyed, userVerifyed } =
      req.body;
    const user = await User.findByIdAndUpdate(id, {
      selfieVerify,
      fullBodyVerify,
      videoBioVerifyed,
      userVerifyed,
    });
    if (user) {
      sendNotification(
        "Congratulation",
        "Nectar has verified your profile",
        user.notificationsToken,
        {
          route: "/dashboard",
        }
      );
      res.status(200).json({
        status: "success",
        message: "User Approved",
        user,
      });
    } else {
      res.status(404).json({
        status: "Not Found",
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

exports.getallAnalysis = async (req, res) => {
  try {
    const totalUser = await User.count();
    const totalUnverifiedUser = await User.find({
      userVerifyed: false,
    }).count();
    const totalActiveUsers = await User.find({ userVerifyed: true }).count();
    const totalBlockedUsers = await User.find({ userblocked: true }).count();
    res.status(200).json({
      status: "success",
      totalUser,
      totalUnverifiedUser,
      totalActiveUsers,
      totalBlockedUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const query = req.params.query;
    if (query.length >= 3) {
      const user = await User.find({
        $or: [{ name: { $regex: query } }],
      }).limit(20);
      res.status(200).json({ status: "success", message: "Search Data", user });
    } else {
      res.status(200).json({ status: "success", message: "enter More text" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const blockId = req.params.blockId;
    const user = await User.findById(blockId);
    console.log(blockId);
    if (user) {
      user.userblocked = true;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "User Blocked successfully",
      });
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.unBlockUser = async (req, res) => {
  try {
    const unBlockId = req.params.unBlockId;
    const user = await User.findById(unBlockId);
    if (user) {
      user.userblocked = false;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "User Unblocked successfully ",
      });
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const deletedMatch = await UserMatch.deleteMany({
      $or: [{ likeUser: user._id }, { likedUser: user._id }],
    });

    const deletedFMMAD = await Referred.deleteMany({
      $or: [{ referredBy: user._id }, { referredUser: user._id }],
    });

    const deleteCommunityQuestion = await CommunityQuestion.deleteMany({
      user: user._id,
    });
    const deleteCommunityQuestionComment =
      await CommunityQuestionComment.deleteMany({ user: user._id });
    const deleteUser = await User.findByIdAndDelete(user._id);
    res
      .status(200)
      .json({ status: "success", message: "user deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.createHelpQuestion = async (req, res) => {
  try {
    console.log(req.body);
    const helpQuestion = await HelpQuestion.create({
      title: req.body.title,
      answer: req.body.answer,
    });
    res.status(201).json({
      status: "success",
      message: "question created successfully",
      helpQuestion,
    });
  } catch {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.updateHelpQuestion = async (req, res) => {
  try {
    const helpQuestion = await HelpQuestion.findByIdAndUpdate(
      req.params.questionId,
      {
        title: req.body.title,
        answer: req.body.answer,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Question updated successfully",
      helpQuestion,
    });
  } catch {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.deleteHelpQuestion = async (req, res) => {
  try {
    const helpQuestion = await HelpQuestion.findByIdAndDelete(
      req.params.questionId
    );
    res.status(200).json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getAllQuestion = async (req, res) => {
  try {
    const helpQuestion = await HelpQuestion.find();
    res.status(200).json({
      status: "success",
      message: "All questions get successfully",
      helpQuestion,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getStatisticsData = async (req, res) => {
  try {
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const janDateTo = `${todayYear}-01-01T00:00:50.490+00:00`;
    const janDateTill = `${todayYear}-02-01T00:00:49.490+00:00`;

    const febDateTo = `${todayYear}-02-01T00:00:50.490+00:00`;
    const febDateTill = `${todayYear}-03-01T00:00:49.490+00:00`;

    const marDateTo = `${todayYear}-03-01T00:00:50.490+00:00`;
    const marDateTill = `${todayYear}-04-01T00:00:49.490+00:00`;

    const aprDateTo = `${todayYear}-04-01T00:00:50.490+00:00`;
    const aprDateTill = `${todayYear}-05-01T00:00:49.490+00:00`;

    const mayDateTo = `${todayYear}-05-01T00:00:50.490+00:00`;
    const mayDateTill = `${todayYear}-06-01T00:00:49.490+00:00`;

    const junDateTo = `${todayYear}-06-01T00:00:50.490+00:00`;
    const junDateTill = `${todayYear}-07-01T00:00:49.490+00:00`;

    const julDateTo = `${todayYear}-07-01T00:00:50.490+00:00`;
    const julDateTill = `${todayYear}-08-01T00:00:49.490+00:00`;

    const augDateTo = `${todayYear}-08-01T00:00:50.490+00:00`;
    const augDateTill = `${todayYear}-09-01T00:00:49.490+00:00`;

    const sepDateTo = `${todayYear}-09-01T00:00:50.490+00:00`;
    const sepDateTill = `${todayYear}-10-01T00:00:49.490+00:00`;

    const octDateTo = `${todayYear}-10-01T00:00:50.490+00:00`;
    const octDateTill = `${todayYear}-11-01T00:00:49.490+00:00`;

    const novDateTo = `${todayYear}-11-01T00:00:50.490+00:00`;
    const novDateTill = `${todayYear}-12-01T00:00:49.490+00:00`;

    const decDateTo = `${todayYear}-12-01T00:00:50.490+00:00`;
    const decDateTill = `${todayYear}-12-01T23:59:59.490+00:00`;

    const yearTransaction = await Transaction.aggregate([
      {
        $facet: {
          jan: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(janDateTo),
                  $lte: new Date(janDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          feb: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(febDateTo),
                  $lte: new Date(febDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          mar: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(marDateTo),
                  $lte: new Date(marDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          apr: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(aprDateTo),
                  $lte: new Date(aprDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          may: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(mayDateTo),
                  $lte: new Date(mayDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          jun: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(junDateTo),
                  $lte: new Date(junDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          jul: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(julDateTo),
                  $lte: new Date(julDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          aug: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(augDateTo),
                  $lte: new Date(augDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          sep: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(sepDateTo),
                  $lte: new Date(sepDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          oct: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(octDateTo),
                  $lte: new Date(octDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          nov: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(novDateTo),
                  $lte: new Date(novDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          dec: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $gte: new Date(decDateTo),
                  $lte: new Date(decDateTill),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
        },
      },
    ]);

    const statistics = await Transaction.aggregate([
      {
        $facet: {
          daily: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $lte: new Date(
                    new Date().getTime() + 1 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          Weekly: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $lte: new Date(
                    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
          Monthly: [
            {
              $match: {
                transactionCompleted: true,
                createdAt: {
                  $lte: new Date(
                    new Date().getTime() + 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$transactionAmount" },
              },
            },
          ],
        },
      },
    ]);

    // yearTransaction
    const graphData = [
      {
        id: 1,
        amount: 0,
        day: "January",
      },
      {
        id: 2,
        amount: 0,
        day: "February",
      },
      {
        id: 3,
        amount: 0,
        day: "March",
      },
      {
        id: 4,
        amount: 0,
        day: "April ",
      },
      {
        id: 5,
        amount: 0,
        day: "May ",
      },
      {
        id: 6,
        amount: 0,
        day: "June ",
      },
      {
        id: 7,
        amount: 0,
        day: "July ",
      },
      {
        id: 8,
        amount: 0,
        day: "August ",
      },
      {
        id: 9,
        amount: 0,
        day: "September ",
      },
      {
        id: 10,
        amount: 0,
        day: "October ",
      },
      {
        id: 11,
        amount: 0,
        day: "November ",
      },
      {
        id: 12,
        amount: 0,
        day: "December ",
      },
    ];
    if (!(yearTransaction[0].jan.length === 0)) {
      graphData[0].amount = yearTransaction[0].jan[0].amount;
    }
    if (!(yearTransaction[0].feb.length === 0)) {
      graphData[1].amount = yearTransaction[0].feb[0].amount;
    }
    if (!(yearTransaction[0].mar.length === 0)) {
      graphData[2].amount = yearTransaction[0].mar[0].amount;
    }
    if (!(yearTransaction[0].apr.length === 0)) {
      graphData[3].amount = yearTransaction[0].apr[0].amount;
    }
    if (!(yearTransaction[0].may.length === 0)) {
      graphData[4].amount = yearTransaction[0].may[0].amount;
    }
    if (!(yearTransaction[0].jun.length === 0)) {
      graphData[5].amount = yearTransaction[0].jun[0].amount;
    }
    if (!(yearTransaction[0].jul.length === 0)) {
      graphData[6].amount = yearTransaction[0].jul[0].amount;
    }
    if (!(yearTransaction[0].aug.length === 0)) {
      graphData[7].amount = yearTransaction[0].aug[0].amount;
    }
    if (!(yearTransaction[0].sep.length === 0)) {
      graphData[8].amount = yearTransaction[0].sep[0].amount;
    }
    if (!(yearTransaction[0].oct.length === 0)) {
      graphData[9].amount = yearTransaction[0].oct[0].amount;
    }
    if (!(yearTransaction[0].nov.length === 0)) {
      graphData[10].amount = yearTransaction[0].nov[0].amount;
    }
    if (!(yearTransaction[0].dec.length === 0)) {
      graphData[11].amount = yearTransaction[0].dec[0].amount;
    }

    res.status(200).json({
      status: "success",
      statistics,
      graphData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
