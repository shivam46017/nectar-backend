const User = require("./../../models/User/userModel");
const Plans = require("./../../models/Plans/plansModel");
const notification = require("./notification");
const Referred = require("./../../models/User/referredModal");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

const addDaysInCurrentDate = (days) => {
  Date.prototype.addDays = function (d) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + d);
    return date;
  };
  var date = new Date();
  const today = date.addDays(days);
  return today;
};

exports.getUsersToShowOnInlimit = async (req, res) => {
  try {
    const { userId, limit, page } = req.params;
    const skip = page * limit - limit;
    const user = await User.findById(userId);
    // console.log(user.myIdealMatch.traditional, user.moreAboutMe.traditional);
    if (user) {
      user.skippedUser.push(user._id);
      const users = await User.find({
        location: {
          $near: {
            $maxDistance: 40075000,
            $geometry: {
              type: "Point",
              coordinates: user.location.coordinates,
            },
          },
        },
        iIdentifyAs: { $eq: user.lookingFor },
        "moreAboutMe.traditional": {
          $gte: user.myIdealMatch.traditional - 5,
          $lte: user.myIdealMatch.traditional + 5,
        },
        "moreAboutMe.spontaneous": {
          $gte: user.myIdealMatch.spontaneous - 5,
          $lte: user.myIdealMatch.spontaneous + 5,
        },
        "moreAboutMe.spiritual": {
          $gte: user.myIdealMatch.spiritual - 5,
          $lte: user.myIdealMatch.spiritual + 5,
        },
        "moreAboutMe.socialButterfly": {
          $gte: user.myIdealMatch.socialButterfly - 5,
          $lte: user.myIdealMatch.socialButterfly + 5,
        },
        "moreAboutMe.smoker": {
          $gte: user.myIdealMatch.smoker,
          $lte: user.myIdealMatch.smoker,
        },
        "moreAboutMe.drinker": {
          $gte: user.myIdealMatch.drinker,
          $lte: user.myIdealMatch.drinker,
        },
        userVerifyed: { $eq: true },
        _id: { $nin: user._id },
        userblocked: { $eq: false },
        "moreAboutMe.height": {
          $gte: user.myIdealMatch.height.start,
          $lte: user.myIdealMatch.height.end,
        },
        "moreAboutMe.age": {
          $gte: user.myIdealMatch.age.start,
          $lte: user.myIdealMatch.age.end,
        },
      })
        .where("_id")
        .nin(user.skippedUser)
        .limit(limit)
        .skip(skip)
        .exec();

      res.status(200).json({
        status: "success",
        message: "Successfully",
        users,
      });
    } else {
      res.status(404).json({ status: "not found", message: "user Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.skippedUser = async (req, res) => {
  try {
    const { skippedUser, userId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      user.skippedUser.push(skippedUser);
      const datad= await user.save();
      console.log(datad)
      res.status(200).json({ status: "success", message: "done" });
    } else {
      res.status(404).json({ status: "not found ", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.UnSkippedUser = async (req, res) => {
  try {
    const { skippedUser, userId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      user.skippedUser.pull(skippedUser);
      await user.save();
      res.status(200).json({ status: "success", message: "done" });
    } else {
      res.status(404).json({ status: "not found ", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.likeUser = async (req, res) => {
  try {
    const { userId, likedUserId } = req.body;
    const user = await User.findById(userId);
    const likeUser = await User.findById(likedUserId);
    console.log(user.like.some((e) => e.id.equals(likeUser._id)));

    if (user && likeUser) {
      const plan = await Plans.findOne({ plan: 0 });
      if (
        !(
          likeUser.matches.some((e) => e.id.equals(user._id)) &&
          user.matches.some((e) => e.id.equals(likeUser._id))
        )
      ) {
        if (user.yourPlan === "free") {
          if (plan.free) {
            if (!user.like.some((e) => e.id.equals(likeUser._id))) {
              user.like.push({
                id: likeUser._id,
                expireTime: addDaysInCurrentDate(1),
              });

              likeUser.otherLike.push({
                id: user._id,
                expireTime: addDaysInCurrentDate(1),
              });
              
              await user.save();
              await likeUser.save();
              if (likeUser.skippedUser.includes({ _id: user._id })) {
                likeUser.skippedUser.pull(user._id);
                await likeUser.save();
              } else {
              }
              res.status(200).json({
                status: "success",
                message: "user liked successfully",
              });
            } else {
              res
                .status(409)
                .json({ status: "conflict", message: "user already liked" });
            }
          } else {
            res.status(203).json({
              status: "success",
              message: "You need to upgrade to Premium plan to like users",
            });
          }
        } else if (user.yourPlan === "premium") {
          if (plan.premium) {
            if (!user.like.includes(id.likeUser._id)) {
              user.like.push(likeUser._id);
              likeUser.otherLike.push(user._id);
              await user.save();
              await likeUser.save();
              if (likeUser.skippedUser.includes(id.user._id)) {
                likeUser.skippedUser.pull(user._id);
                await likeUser.save();
              } else {
              }
              res.status(200).json({
                status: "success",
                message: "user liked successfully",
              });
            } else {
              res
                .status(409)
                .json({ status: "conflict", message: "user already liked" });
            }
            if (!user.like.some((e) => e.id.equals(likeUser._id))) {
              user.like.push({
                id: likeUser._id,
                expireTime: addDaysInCurrentDate(1),
              });
              likeUser.otherLike.push({
                id: user._id,
                expireTime: addDaysInCurrentDate(1),
              });
              await user.save();
              await likeUser.save();
              if (likeUser.skippedUser.includes({ _id: user._id })) {
                likeUser.skippedUser.pull(user._id);
                await likeUser.save();
              } else {
              }
              res.status(200).json({
                status: "success",
                message: "user liked successfully",
              });
            } else {
              res
                .status(409)
                .json({ status: "conflict", message: "user already liked" });
            }
          } else {
            res.status(203).json({
              status: "success",
              message: "This feature is not available",
            });
          }
        } else {
          res
            .status(500)
            .json({ status: "error", message: "some this in not working " });
        }
      } else {
        res.status(409).json({
          status: "already ",
          message: "You already matched this user",
        });
      }
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getUsersLiked = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    // const likedList = user.like;

    const userIdArray = [];
    const likedDataArray = [];
    for (let i = 0; i < user.like.length; i++) {
      const element = user.like[i];
      userIdArray.push(element.id);
    }
    const likedList = await User.find().where("_id").in(userIdArray);

    for (let x = 0; x < likedList.length; x++) {
      const element = likedList[x];
      for (let y = 0; y < user.like.length; y++) {
        const likeElement = user.like[y];

        if (likeElement.id.equals(element._id)) {
          Object.assign(element, { expireTime: likeElement.expireTime });
          Object.assign(element, { likedTime: likeElement.likedTime });

          likedDataArray.push({
            user: element,
            likeData: {
              expireTime: likeElement.expireTime,
              likedTime: likeElement.likedTime,
            },
          });
        }
      }
    }
    res
      .status(200)
      .json({ status: "success", message: "successfully", likedDataArray });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getUsersMatches = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    // const userIdArray = [];
    // user.matches.some((e) => userIdArray.push(e.id));
    // const matchesList = await User.find().where("_id").in(userIdArray);
    const userIdArray = [];
    const matchesList = [];
    for (let i = 0; i < user.matches.length; i++) {
      const element = user.like[i];
      userIdArray.push(element.id);
    }
    const likedList = await User.find().where("_id").in(userIdArray);

    for (let x = 0; x < likedList.length; x++) {
      const element = likedList[x];
      for (let y = 0; y < user.matches.length; y++) {
        const likeElement = user.like[y];

        if (likeElement.id.equals(element._id)) {
          Object.assign(element, { expireTime: likeElement.expireTime });
          Object.assign(element, { likedTime: likeElement.likedTime });

          matchesList.push({
            user: element,
            likeData: {
              expireTime: likeElement.expireTime,
              likedTime: likeElement.likedTime,
            },
          });
        }
      }
    }
    res
      .status(200)
      .json({ status: "success", message: "successfully", matchesList });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.removeFromSkipUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const skippedUser = await User.findById(req.body.skippedUserId);
    user.skippedUser.pull(skippedUser._id);
    res.status(200).json({ status: "success", message: "Successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.whoLikedYou = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const currentDate = new Date(Date.now());

    const userIdArray = [];
    const whoLikedYouList = [];
    for (let i = 0; i < user.otherLike.length; i++) {
      const element = user.otherLike[i];
      userIdArray.push(element.id);
    }
    const likedList = await User.find().where("_id").in(userIdArray);

    for (let x = 0; x < likedList.length; x++) {
      const element = likedList[x];
      for (let y = 0; y < user.otherLike.length; y++) {
        const likeElement = user.otherLike[y];

        if (
          likeElement.id.equals(element._id) &&
          likeElement.expireTime > currentDate
        ) {
          whoLikedYouList.push({
            user: element,
            likeData: {
              expireTime: likeElement.expireTime,
              likedTime: likeElement.likedTime,
            },
          });
        } else if (
          likeElement.id.equals(element._id) &&
          likeElement.expireTime < currentDate
        ) {
          user.otherLike.pull(likeElement);
        }
      }
    }
    console.log(user.otherLike);
    await user.save();

    // const userIdArray = [];
    // user.otherLike.some((e) => userIdArray.push(e.id));

    // const whoLikedYouList = await User.find().where("_id").in(userIdArray);
    res
      .status(200)
      .json({ status: "success", message: "successfully", whoLikedYouList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.matchUser = async (req, res) => {
  try {
    const { userId, matchUserId } = req.body;
    const matchUser = await User.findById(userId);
    const user = await User.findById(matchUserId);

    if (user && matchUser) {
      if (
        !(
          matchUser.matches.some((e) => e.id.equals(user._id)) &&
          user.matches.some((e) => e.id.equals(matchUser._id))
        )
      ) {
        if (matchUser.like.some((e) => e.id.equals(user._id))) {
          if (user.like.some((e) => e.id.equals(matchUser._id))) {
            const index = user.like.findIndex(function (element) {
              return element.id.equals(matchUser._id);
            });
            user.like.splice(index, 1);

            // user.like.pull(matchUser._id);
          } else {
          }
          if (matchUser.like.some((e) => e.id.equals(user._id))) {
            const index = matchUser.like.findIndex(function (element) {
              return element.id.equals(user._id);
            });
            matchUser.like.splice(index, 1);
            // matchUser.like.pull(user._id);
          } else {
          }
          user.matches.push({
            id: matchUser._id,
            expireTime: addDaysInCurrentDate(7),
          });
          matchUser.matches.push({
            id: user._id,
            expireTime: addDaysInCurrentDate(7),
          });
          await user.save();
          await matchUser.save();
          res
            .status(200)
            .json({ status: "success", message: "successfully matched" });
        } else {
          res.status(401).json({
            status: "error",
            message: `You cannot match user because ${matchUser.name} not like you.`,
          });
        }
      } else {
        res.status(409).json({
          status: "already ",
          message: "You already matched this user",
        });
      }
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.unMatchUser = async (req, res) => {
  const { userId, unMatchUserId } = req.body;
  const user = await User.findById(userId);
  const unMatchUser = await User.findById(unMatchUserId);
  if (user && unMatchUser) {
    user.matches.pull(unMatchUser._id);
    unMatchUser.matches.pull(user._id);
    await user.save();
    await unMatchUser.save();
    res
      .status(200)
      .json({ status: "success", message: "successfully unMatched user" });
  } else {
    res.status(404).json({ status: "not found", message: "user not found" });
  }
};

exports.findMyMateADate = async (req, res) => {
  try {
    const { userId, profileUserId, friendPhoneNo } = req.body;
    const user = await User.findById(userId);
    const profileUser = await User.findById(profileUserId);
    if (profileUser && user) {
      const plan = await Plans.findOne({ plan: 12 });
      if (user.yourPlan === "free") {
        if (plan.free) {
          const referred = await Referred.create({
            referredBy: user._id,
            refererTo: friendPhoneNo,
            referredUser: profileUser._id,
          });

          client.messages
            .create({
              body: `It’s time you went on a date! Your friend ${user.name} is playing Cupid with Nectar’s FMMD. Click here to check out their profile. https://www.nectardating.com/${profileUser._id}`,
              // from: twilioNumber,
              from: "Nectar_2022",
              to: friendPhoneNo,
            })
            .then((message) => console.log(message.sid))
            .catch((e) => {
              console.log(e);
            });

          console.log(`Your friend ${user.name} has find
a mate for you. Do check it
on nectar Click on https://www.nectardating.com/${profileUser._id}`);

          console.log(`free `);
          res.status(200).json({
            status: "success",
            message: "SMS sended to the Given Phone Number",
          });
        } else {
          res.status(203).json({
            status: "success",
            message: "You need to upgrade to Premium plan to Use this feature",
          });
        }
      } else if (user.yourPlan === "premium") {
        if (plan.premium) {
          const referred = await Referred.create({
            referredBy: user._id,
            refererTo: friendPhoneNo,
            referredUser: profileUser._id,
          });
          client.messages
            .create({
              body: `It’s time you went on a date! Your friend ${user.name} is playing Cupid with Nectar’s FMMD. Click here to check out their profile. https://www.nectardating.com/${profileUser._id}`,
              // from: twilioNumber,
              from: "Nectar_2022",
              to: friendPhoneNo,
            })
            .then((message) => console.log(message.sid))
            .catch((e) => {
              console.log(e);
            });

          console.log(
            `Your friend ${user.name} has find a mate for you. Do check it on nectar Click on http://192.168.29.202:8080/api/v1/users/getUser/${profileUser._id}`
          );
          console.log(
            "Cupid is playing match maker, and referred you to a potential date... lets wait and see"
          );
          notification.sendNotification(
            "SomeOne is referred you",
            "Cupid is playing match maker, and referred you to a potential date... lets wait and see",
            profileUser.notificationsToken
          );
          res.status(200).json({
            status: "success",
            message: "SMS sended to the Given Phone Number",
          });
        } else {
          res.status(203).json({
            status: "success",
            message: "This feature is not available",
          });
        }
      } else {
        res
          .status(500)
          .json({ status: "error", message: "some this in not working " });
      }
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.status(200).json({ success: "success", message: "success", user });
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getReferredList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const referred = await Referred.find({
      referredBy: { $eq: user._id },
    }).populate("referredUser");

    res
      .status(200)
      .json({ status: "success", message: "Successfully", referred });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getRecommendedList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const recommended = await Referred.find({
      refererTo: { $eq: user.phone },
    }).populate("referredUser");
    res
      .status(200)
      .json({ status: "success", message: "Successfully", recommended });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.getUserDetailsByPhone = async (req, res) => {
  try {
    const user = await User.findOne({ phone: { $eq: req.body.phone } });
    if (user) {
      res
        .status(200)
        .json({ status: "success", message: "Successfully", user });
    } else {
      res.status(404).json({ status: "notfound", message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
