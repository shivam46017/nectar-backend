const User = require("../../models/User/userModel");
const UserMatch = require("../../models/User/userMatchModel");
const CommunityQuestion = require("./../../models/User/communityQuestionModel");
const CommunityQuestionComment = require("./../../models/User/communityQuestionCommentModel");
const notification = require("../../controllers/User/fireBaseAuth");
const Referred = require("../../models/User/referredModal");
const HelpQuestion = require("../../models/User/helpQuestionModel");
const PremiumPrice = require("../../models/Plans/premiumPriceModel");
const { getAuth } = require("firebase-admin/auth");
exports.setUserLocation = async () => {};

exports.getPremiumPrice = async (req, res) => {
  try {
    const premiumPrice = await PremiumPrice.findOne({ premium: "premium" });
    if (premiumPrice) {
      const price = [
        { duration: "weekly", name: "Weekly", price: premiumPrice.weekly },
        { duration: "monthly", name: "Monthly", price: premiumPrice.monthly },
        {
          duration: "quarterly",
          name: "3 months",
          price: premiumPrice.quarterly,
        },
        {
          duration: "semiyearly",
          name: "6 months",
          price: premiumPrice.semiyearly,
        },
        { duration: "yearly", name: "12 months", price: premiumPrice.yearly },
      ];
      res.status(200).json({
        status: "success",
        message: " Successfully",
        price,
      });
    }else
    res.status(404).json({
      status: "success",
      message: "No plan found",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server Error",
    });
  }
};

exports.iWantToSwipe = async (req, res) => {
  try {
    const { userId } = req.params;
    const { iWantToSwipe } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.iWantToSwipe = iWantToSwipe;
      await user.save();
      res
        .status(200)
        .json({ success: "success", message: "Updated successfully" });
    } else {
      res.status(404).json({ success: "not found", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.updateNotificationToken = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notificationsToken } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.notificationsToken = notificationsToken;
      await user.save();
      res
        .status(200)
        .json({ success: "success", message: "Updated successfully" });
    } else {
      res.status(404).json({ success: "not found", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.editDatingPreference = async (req, res) => {
  try {
    const { userId, myIdealMatch, lookingFor } = req.body;
    console.log(userId, myIdealMatch, lookingFor);

    const user = await User.findById(userId);
    user.myIdealMatch = JSON.parse(myIdealMatch);
    // console.log(user.myIdealMatch);
    user.lookingFor = lookingFor;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "user dating preference changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.updateEmailId = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const user = await User.findById(userId);
    user.email = email;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "user email updated successFully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId, updateProfileData } = req.body;
    const {
      name,
      smoker,
      drinker,
      traditional,
      spontaneous,
      spiritual,
      socialButterfly,
      height,
      age,
    } = JSON.parse(updateProfileData);
    const user = await User.findById(userId);
    if (name) {
      user.name = name;
    }
    if (smoker) {
      user.moreAboutMe.smoker = smoker;
    }
    if (drinker) {
      user.moreAboutMe.drinker = drinker;
    }
    if (traditional) {
      user.moreAboutMe.traditional = traditional;
    }
    if (spontaneous) {
      user.moreAboutMe.spontaneous = spontaneous;
    }
    if (spiritual) {
      user.moreAboutMe.spiritual = spiritual;
    }
    if (socialButterfly) {
      user.moreAboutMe.socialButterfly = socialButterfly;
    }
    if (height) {
      user.moreAboutMe.height = height;
    }
    if (age) {
      user.moreAboutMe.age = age;
    }
    await user.save();
    res.status(200).json({
      status: "success",
      message: "user Profile updated successFully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    // const deletedMatch = await UserMatch.deleteMany({
    //   $or: [{ likeUser: user._id }, { likedUser: user._id }],
    // });

    // const deletedFMMAD = await Referred.deleteMany({
    //   $or: [
    //     { referredBy: user._id },
    //     { referredUser: user._id },
    //     { refererTo: user.phone },
    //   ],
    // });

    // const deleteCommunityQuestion = await CommunityQuestion.deleteMany({
    //   user: user._id,
    // });
    // const deleteCommunityQuestionComment =
    //   await CommunityQuestionComment.deleteMany({ user: user._id });
    const deleteUser = await User.findByIdAndDelete(user._id);
    // delete user from firebase
    getAuth()
      .deleteUser(req.params.firebaseUserId)
      .then(() => {
        console.log("Successfully deleted user");
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
      });
    res
      .status(200)
      .json({ status: "success", message: "user deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error: "+ error  });
  }
};

// const data = {
//   age: { start: 25.0, end: 50.0 },
//   children: "Yes and want more",
//   drinker: "Socially",
//   distance: 45.0,
//   height: { start: 148.0, end: 189.0 },
//   smoker: "Socially",
//   socialButterfly: 30,
//   spiritual: 35,
//   spontaneous: 40,
//   traditional: 55,
// };

exports.testNotification = async (req, res) => {
  try {
    const { mgsTitle, mgsBody, token, data } = req.body;
    notification.sendNotification(mgsTitle, mgsBody, token, data);
    res.status(200).json({ status: "send", message: "notification gaya " });
  } catch (error) {
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

// const stripe = require("stripe")(process.env.STRIPE_KEY);

// stripe.customers
//   .create({
//     email: "lilitran127@gmail.com",
//   })
//   .then((customer) => console.log(customer.email))
//   .catch((error) => console.error(error));
