const User = require("../../models/User/userModel");
const UserMatch = require("../../models/User/userMatchModel");
const { sendNotification } = require("../../controllers/User/fireBaseAuth");

const OutOfLike = require("../../models/User/outOfLikeModel");
const { db } = require("./fireBaseAuth");
const compareTwoDate = (date1) => {
  const dateOne = new Date(date1);
  const dateTwo = new Date(Date.now());
  const d1 = `${dateOne.getFullYear()}-${
    dateOne.getMonth() + 1
  }-${dateOne.getDate()}`;
  const d2 = `${dateTwo.getFullYear()}-${
    dateTwo.getMonth() + 1
  }-${dateTwo.getDate()}`;
  return d1 === d2;
};
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

exports.likeUser = async (req, res) => {
  try {
    const { userId, likeUserId } = req.body;
    const user = await User.findById(userId);
    const likeUser = await User.findById(likeUserId);

    if (userId && likeUserId) {
      const currentTime = new Date(Date.now());

      const checkLike1 = await UserMatch.findOne({ likeUser: user._id });
      const checkLike2 = await UserMatch.findOne({ likedUser: user._id });
      const checkOtherLike1 = await UserMatch.findOne({
        likedUser: likeUser._id,
      });
      const checkOtherLike2 = await UserMatch.findOne({
        likeUser: likeUser._id,
      });

      if (checkLike1 && checkOtherLike1) {
        if (checkLike1.expireTime > currentTime) {
          if (checkLike1.match) {
            console.log("first");
            res.status(410).json({
              status: "success",
              message: "You are allReady Matched1",
            });
          } else {
            res
              .status(409)
              .json({ status: "conflict", message: "You all ready like user" });
          }
        } else if (checkLike1.expireTime < currentTime) {
          await UserMatch.findByIdAndDelete(checkLike1._id);

          if (user.yourPlan === "free") {
            console.log("free");
            let remainingLike = 0;
            const findOutOfLike = await OutOfLike.findOne({ user: user._id });
            if (findOutOfLike) {
              if (compareTwoDate(findOutOfLike.todayDate)) {
                findOutOfLike.remainingLike = findOutOfLike.remainingLike - 1;
                remainingLike = findOutOfLike.remainingLike;
                await findOutOfLike.save();
              } else {
                findOutOfLike.todayDate = new Date(Date.now());
                findOutOfLike.remainingLike = 3;
                remainingLike = 3;
                await findOutOfLike.save();
              }
            } else {
              await OutOfLike.create({
                todayDate: new Date(Date.now()),
                remainingLike: 3,
                user: user._id,
              });
              remainingLike = 3;
            }
            if (remainingLike > 0) {
              const createLike = await UserMatch.create({
                likeUser: user._id,
                likedUser: likeUser._id,
                expireTime: addDaysInCurrentDate(1),
              });
              likeUser.skippedUser.pull(user._id);
              await likeUser.save();
              sendNotification(
                "Congratulation",
                `${user.name} has like you`,
                likeUser.notificationsToken,
                {
                  route: "/dashboard?index=1",
                }
              );
              res.status(200).json({
                status: "success",
                message: "User liked successfully",
                createLike,
                remainingLike,
              });
            } else {
              res.status(202).json({
                status: "upgrade",
                message: "upgrade to premium plan",

                remainingLike,
              });
            }
          } else {
            const createLike = await UserMatch.create({
              likeUser: user._id,
              likedUser: likeUser._id,
              expireTime: addDaysInCurrentDate(1),
            });
            likeUser.skippedUser.pull(user._id);
            await likeUser.save();
            sendNotification(
              "Congratulation",
              `${user.name} has like you`,
              likeUser.notificationsToken,
              {
                route: "/dashboard?index=1",
              }
            );
            res.status(200).json({
              status: "success",
              message: "User liked successfully",
              createLike,
            });
          }
          // const createLike = await UserMatch.create({
          //   likeUser: user._id,
          //   likedUser: likeUser._id,
          //   expireTime: addDaysInCurrentDate(1),
          // });
          // likeUser.skippedUser.pull(user._id);
          // await likeUser.save();
          // res.status(200).json({
          //   status: "success",
          //   message: "User liked successfully",
          //   createLike,
          // });
        }
      } else if (checkLike2 && checkOtherLike2) {
        if (checkLike2.expireTime > currentTime) {
          if (checkLike2.match) {
            console.log(checkLike2);
            console.log("2");
            res.status(410).json({
              status: "success",
              message: "You are allReady Matched1",
            });
          } else {
            checkLike2.match = true;
            checkLike2.expireTime = addDaysInCurrentDate(7);
            const user1 = {
              userName: `${user.name}`,
              isOnline: false,
              unreadMessages: 0,
              imageId: `${user.selfie}`,
              lastSeen: `${currentTime}`,
            };
            const user2 = {
              userName: `${likeUser.name}`,
              isOnline: false,
              unreadMessages: 0,
              imageId: `${likeUser.selfie}`,
              lastSeen: `${currentTime}`,
            };
            const chatData = {
              users: [`${checkLike2.likeUser}`, `${checkLike2.likedUser}`],
            };

            let user1Ref = db.collection("users").doc(`${user._id}`);
            user1Ref
              .get()
              .then(async (doc) => {
                if (doc.exists) {
                  console.log("Document data:", doc.data());
                } else {
                  const firedDb = await db
                    .collection("users")
                    .doc(`${user._id}`)
                    .set(user1);
                  console.log("No such document!");
                }
              })
              .catch(function (error) {
                console.log("Error getting document:", error);
              });
            let user2Ref = db.collection("users").doc(`${likeUser._id}`);
            user2Ref
              .get()
              .then(async (doc) => {
                if (doc.exists) {
                  // console.log("Document data:", doc.data());
                } else {
                  const firedDb = await db
                    .collection("users")
                    .doc(`${likeUser._id}`)
                    .set(user2);
                  console.log("No such document!");
                }
              })
              .catch(function (error) {
                console.log("Error getting document:", error);
              });
            await db.collection("chats").doc(`${checkLike2._id}`).set(chatData);
            await checkLike2.save();

            res
              .status(201)
              .json({ status: "success", message: "user match successfully1" });
          }
        } else if (checkLike2.expireTime < currentTime) {
          await UserMatch.findByIdAndDelete(checkLike2._id);

          if (user.yourPlan === "free") {
            console.log("free");
            let remainingLike = 0;
            const findOutOfLike = await OutOfLike.findOne({ user: user._id });
            if (findOutOfLike) {
              if (compareTwoDate(findOutOfLike.todayDate)) {
                findOutOfLike.remainingLike = findOutOfLike.remainingLike - 1;
                remainingLike = findOutOfLike.remainingLike;
                await findOutOfLike.save();
              } else {
                findOutOfLike.todayDate = new Date(Date.now());
                findOutOfLike.remainingLike = 3;
                remainingLike = 3;
                await findOutOfLike.save();
              }
            } else {
              await OutOfLike.create({
                todayDate: new Date(Date.now()),
                remainingLike: 3,
                user: user._id,
              });
              remainingLike = 3;
            }
            if (remainingLike > 0) {
              const createLike = await UserMatch.create({
                likeUser: user._id,
                likedUser: likeUser._id,
                expireTime: addDaysInCurrentDate(1),
              });
              likeUser.skippedUser.pull(user._id);
              await likeUser.save();
              res.status(200).json({
                status: "success",
                message: "User liked successfully",
                createLike,
                remainingLike,
              });
            } else {
              res.status(202).json({
                status: "upgrade",
                message: "upgrade to premium plan",

                remainingLike,
              });
            }
          } else {
            const createLike = await UserMatch.create({
              likeUser: user._id,
              likedUser: likeUser._id,
              expireTime: addDaysInCurrentDate(1),
            });
            likeUser.skippedUser.pull(user._id);
            await likeUser.save();
            res.status(200).json({
              status: "success",
              message: "User liked successfully p",
              createLike,
            });
          }
        }
      } else {
        // const createLike = await UserMatch.create({
        //   likeUser: user._id,
        //   likedUser: likeUser._id,
        //   expireTime: addDaysInCurrentDate(1),
        // });
        // likeUser.skippedUser.pull(user._id);
        // await likeUser.save();
        // res.status(200).json({
        //   status: "success",
        //   message: "User liked successfully",
        //   createLike,
        // });

        if (user.yourPlan === "free") {
          console.log("free");
          let remainingLike = 0;
          const findOutOfLike = await OutOfLike.findOne({ user: user._id });
          if (findOutOfLike) {
            if (compareTwoDate(findOutOfLike.todayDate)) {
              findOutOfLike.remainingLike = findOutOfLike.remainingLike - 1;
              remainingLike = findOutOfLike.remainingLike;
              await findOutOfLike.save();
            } else {
              findOutOfLike.todayDate = new Date(Date.now());
              findOutOfLike.remainingLike = 3;
              remainingLike = 3;
              await findOutOfLike.save();
            }
          } else {
            await OutOfLike.create({
              todayDate: new Date(Date.now()),
              remainingLike: 3,
              user: user._id,
            });
            remainingLike = 3;
          }
          if (remainingLike > 0) {
            // const createLike = await UserMatch.create({
            //   likeUser: user._id,
            //   likedUser: likeUser._id,
            //   expireTime: addDaysInCurrentDate(1),
            // });
            // likeUser.skippedUser.pull(user._id);
            // await likeUser.save();
            // res.status(200).json({
            //   status: "success",
            //   message: "User liked successfully",
            //   createLike,
            //   remainingLike,
            // });
            const createLike = await UserMatch.create({
              likeUser: user._id,
              likedUser: likeUser._id,
              expireTime: addDaysInCurrentDate(1),
            });
            likeUser.skippedUser.pull(user._id);
            await likeUser.save();
            res.status(200).json({
              status: "success",
              message: "User liked successfully",
              createLike,
              remainingLike,
            });
          } else {
            res.status(202).json({
              status: "upgrade",
              message: "upgrade to premium plan",

              remainingLike,
            });
          }
        } else {
          const createLike = await UserMatch.create({
            likeUser: user._id,
            likedUser: likeUser._id,
            expireTime: addDaysInCurrentDate(1),
          });
          likeUser.skippedUser.pull(user._id);
          await likeUser.save();
          res.status(200).json({
            status: "success",
            message: "User liked successfully",
            createLike,
          });
        }
      }
    } else {
      console.log("Sahi Data Bhejo");
      res.status(204).json({ status: "error", message: "send correct data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
exports.admirers = async (req, res) => {
  console.log("from admirer")
  try {
    const user = await User.findById(req.params.userId);
    const currentTime = new Date(Date.now());
    const admirersData = await UserMatch.find({
      match: false,
      likeUser: user._id,
    }).populate("likedUser");
    console.log("admirersData", admirersData);
    const expireAdmirers = [];
    const admirers = [];
    for (let i = 0; i < admirersData.length; i++) {
      const element = admirersData[i];
      if (element.expireTime > currentTime) {
        admirers.push(element);
      } else {
        expireAdmirers.push(element._id);
      }
    }
    await UserMatch.deleteMany({ _id: { $in: expireAdmirers } });

    res
      .status(200)
      .json({ status: "success", message: "successfully", admirers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.matchList = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const currentTime = new Date(Date.now());
    const matchData = await UserMatch.find({
      $or: [
        { likeUser: user._id, match: true },
        { likedUser: user._id, match: true },
      ],
    }).populate("likedUser");
    const expireMatch = [];
    const matchDataList = [];
    for (let i = 0; i < matchData.length; i++) {
      const element = matchData[i];
      if (element.expireTime > currentTime) {
        matchDataList.push(element);
      } else {
        expireMatch.push(element._id);
      }
    }
    await UserMatch.deleteMany({ _id: { $in: expireMatch } });

    res
      .status(200)
      .json({ status: "success", message: "successfully", matchDataList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.updateExpireTime = async (req, res) => {
  try {
    const relationship = await UserMatch.findById(req.params.relationshipId);
    relationship.expireTime = addDaysInCurrentDate(7);
    relationship.save();
    res.status(200).json({
      status: "success",
      message: "Time Updated successfully",
      relationship,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.deleteRelationship = async (req, res) => {
  try {
    const relationship = await UserMatch.findByIdAndDelete(
      req.params.relationshipId
    );

    res.status(200).json({
      status: "success",
      message: "Relationship deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
