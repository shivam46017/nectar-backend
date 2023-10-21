require("dotenv").config();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const moment = require("moment");
const User = require("../../../models/User/userModel");
const ActivityToken = require("../../../models/User/activityTokenModel");
const VideoCall = require("../../../models/User/userVideoCallModel");
const { sendNotification } = require("../fireBaseAuth");
const uuid = require('uuid');



//  below code determine the agora video calling code
exports.generateTokenForLiveStreamsPublisher = async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        const { publisher } = req.body;
        const user = await User.findById(publisher).select("phone");
        console.log(user);

        const uid = convertGuidToInt(uuid.v4());
        const chanelName = `${publisher}-${new Date().valueOf()}`;
        const publisherRole = RtcRole.PUBLISHER;
        const publisherToken = RtcTokenBuilder.buildTokenWithUid(
            process.env.APP_ID,
            process.env.APP_CERTIFICATE,
            uid,
            chanelName,
            publisher,
            publisherRole
        );
        const liveTokenList = await ActivityToken.find({
            validity: "Valid",
        })
            .select("_id chanelName publisher")
            .limit(5);
        const activity = await ActivityToken.create({
            publisher,
            publisherToken,
            uid,
            chanelName,
            liveTokenList: liveTokenList,
            typeOf: "liveStream",
        });
        res.status(200).json({
            status: "Success",
            message: "All Good",
            channelId: activity._id,
            channelName: chanelName,
            userId: uid,
            renderToken: publisherToken,
            liveUsers: liveTokenList,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            Status: "Success",
            message: "Internal Server Error",
        });
    }
};

exports.liveTokenList = async (req, res) => {
    const { tokenId } = req.body;
    const token = await ActivityToken.findById(tokenId).select("liveTokenList");
    const previousList = token.liveTokenList;
    const tokenList = await ActivityToken.find({
        _id: { $nin: previousList },
        validity: "Valid",
    })
        .select("_id chanelName publisher")
        .limit(5);
    const list02 = [...previousList, ...tokenList];
    token.liveTokenList = list02;
    await token.save();
    res.status(200).json({
        status: "Success",
        message: "Live Token List",
        tokenList: tokenList,
    });
};

exports.generateTokenForLiveStreamsSubscriber = async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        const { chanelId, timeToExpire, subscriber } = req.body;
        const subscriberRole = RtcRole.SUBSCRIBER;
        let expireTime = 0;

        if (!timeToExpire || timeToExpire === "") {
            expireTime = 3600;
        } else {
            let expireTimeDefault = parseInt(timeToExpire, 10) * 60;
            const currentTime = Math.floor(Date.now() / 1000);
            expireTime = currentTime + expireTimeDefault;
        }
        const activity = await ActivityToken.findById(chanelId);
        if (activity.validity === "Expire") {
            res.status(200).json({
                status: "Success",
                message: "Live Stream has Ended",
            });
        } else {
            const subscriberToken = RtcTokenBuilder.buildTokenWithAccount(
                process.env.APP_ID,
                process.env.APP_CERTIFICATE,
                activity.chanelName,
                subscriber,
                subscriberRole,
                expireTime
            );
            activity.subscriber.push(subscriber);
            activity.subscriberToken.push(subscriberToken);
            await activity.save();
            res.status(200).json({
                status: "Success",
                message: "All Good",
                data: expireTime,
                channelId: activity._id,
                channelName: activity.chanelName,
                remoteToken: subscriberToken,
            });
        }
    } catch (error) {
        res.status(500).json({
            Status: "Success",
            message: "Internal Server Error",
        });
    }
};

exports.CallTokenExpire = async (req, res) => {
    try {
        const { channelId } = req.body;
        const token = await ActivityToken.findByIdAndDelete(channelId);
        res.status(200).json({
            status: "Success",
            message: "Token Expired",
        });
    } catch (error) {
        res.status(500).json({
            status: "Success",
            message: "Internal Server Error",
            error: error,
        });
    }
};

exports.checkUserAndUpdateToken = async (req, res) => {
    try {
        const { userId } = req.body;
        res.header("Access-Control-Allow-Origin", "*");
        const activityTokenWaiting = await ActivityToken.findOne({
            typeOf: "liveStream",
            validity: "Valid",
            liveStreamWaiting: true,
        });
        if (!activityTokenWaiting) {
            console.log("Publisher Token Generations Started");
            const user = await User.findById(userId).select("name phone");
            // let userPhone = user.phone;
            const uid = convertGuidToInt(uuid.v4());
            const randomNumber = Math.floor(1000 + Math.random() * 5000);
            const userName = user.name.slice(1, 5);
            const chanelName = `${userName}${randomNumber}`;

            const publisherToken = RtcTokenBuilder.buildTokenWithAccount(
                process.env.APP_ID,
                process.env.APP_CERTIFICATE,
                chanelName,
                Number(uid)
            );
            const activity = await ActivityToken.create({
                publisher: userId,
                publisherToken,
                publisherUid: uid,
                chanelName,
                liveStreamWaiting: true,
                typeOf: "liveStream",
            });
            console.log("Publisher Token Generated Successfully");
            let resStatus = false;
            setTimeout(async () => {
                const activityToken2 = await ActivityToken.findById(activity._id);
                if (activityToken2.liveStreamWaiting) {
                    await ActivityToken.findByIdAndDelete(activityToken2._id);
                    resStatus = true;
                    console.log("No Live Stream Found");
                    res.status(404).json({
                        status: 404,
                        message: "No Live Stream is Founded",
                    });
                }
            }, 60000);
            const personEventEmitter = ActivityToken.watch();
            personEventEmitter.on("change", async (change) => {
                if (
                    change.operationType === "update" &&
                    change.updateDescription.updatedFields.liveStreamWaiting === false
                ) {
                    if (!resStatus) {
                        const activity3 = await ActivityToken.findById(activity._id).select(
                            "publisherUid chanelName publisher publisherToken"
                        );
                        res.status(200).json({
                            status: 200,
                            message: "Live Room Find and Joined",
                            token: activity3,
                        });
                    }
                }
                await personEventEmitter.close();
            });
        } else {
            console.log("Subscriber Token Genraction Started");
            // const subscriberRole = RtcRole.SUBSCRIBER;
            const user = await User.findById(userId).select("phone");
            // let userPhone = user.phone;
            const uid = convertGuidToInt(uuid.v4());

            const subscriberToken = RtcTokenBuilder.buildTokenWithAccount(
                process.env.APP_ID,
                process.env.APP_CERTIFICATE,
                activityTokenWaiting.chanelName,
                Number(uid)
            );
            activityTokenWaiting.liveStreamWaiting = false;
            activityTokenWaiting.subscriberUid = uid;
            activityTokenWaiting.subscriber = userId;
            activityTokenWaiting.subscriberToken = subscriberToken;
            await activityTokenWaiting.save();
            console.log("Subscriber Token Genraction SuccessFully");
            const token = {
                _id: activityTokenWaiting._id,
                uid: Number(uid),
                chanelName: activityTokenWaiting.chanelName,
                subscriber: userId,
                subscriberToken: subscriberToken,
            };
            setTimeout(async () => {
                res.status(201).json({
                    status: 201,
                    message: "Subscriber Token Generated and Chanel Joined",
                    token: token,
                });
            }, 10000);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error,
        });
    }
};

exports.videoCallToken = async (req, res) => {
    try {
        // res.header("Access-Control-Allow-Origin", "*");
        const { fromUser, toUser } = req.body;
        console.log(`fromUser ${fromUser}`);
        const callFromUser = await User.findById(fromUser);
        const callToUser = await User.findById(toUser);

        const val = Math.floor(1000 + Math.random() * 3000);
        const chanelName = `${callFromUser.name}${val}`;

        // let callFromUserPhone = callFromUser.phone;
        // let callToUserPhone = callToUser.phone;
        const callFromUid = convertGuidToInt(uuid.v4());
        const callToUid = convertGuidToInt(uuid.v4());

        const callFromToken = RtcTokenBuilder.buildTokenWithAccount(
            process.env.APP_ID,
            process.env.APP_CERTIFICATE,
            chanelName,
            Number(callFromUid)
        );

        const callToToken = RtcTokenBuilder.buildTokenWithAccount(
            process.env.APP_ID,
            process.env.APP_CERTIFICATE,
            chanelName,
            Number(callToUid)
        );
        const newVideoCall = await VideoCall.create({
            callFromUid: callFromUid,
            callToUid: callToUid,
            chanelName: chanelName,
            fromUser: fromUser,
            toUser: toUser,
            callFromToken: callFromToken,
            callToToken: callToToken,
        });
        const msgTitle = `Incoming Nectar Video Call`;
        const msgBody = `Incoming Video Call From ${callFromUser.name}`;
        const data = {
            route: `/inComingCall?callFromPic=${callFromUser.selfie}&callFromName=${callFromUser.name}&callId=${newVideoCall._id}&agoraToken=${callToToken}`,
        };
        console.log(callToUser.notificationsToken);
        sendNotification(msgTitle, msgBody, callToUser.notificationsToken, data);
        let resStatus = false;
        setTimeout(async () => {
            const VideoCallVerify = await VideoCall.findById(newVideoCall._id).select(
                "videoCallStatus"
            );
            if (
                VideoCallVerify.videoCallStatus === "Waiting" ||
                VideoCallVerify.videoCallStatus === "Declined"
            ) {
                if (resStatus) {
                    const videoCallSt = await VideoCall.findById(VideoCallVerify._id);
                    videoCallSt.videoCallStatus = "Missed";
                    await videoCallSt.save();
                    resStatus = true;
                    const msgTitle = `Missed Video Call From ${callFromUser.name}`;
                    const msgBody = `${moment(newVideoCall.updatedAt).format("lll")}`;
                    sendNotification(
                        msgTitle,
                        msgBody,
                        callToUser.notificationsToken,
                        {}
                    );
                    res.status(404).json({
                        status: 404,
                        message: "Video Call Not Answered",
                    });
                }
            }
        }, 10000);
        const personEventEmitter = VideoCall.watch();
        personEventEmitter.on("change", async (change) => {
            if (
                change.operationType === "update" &&
                `${change.documentKey._id}` === `${newVideoCall._id}` &&
                change.updateDescription.updatedFields.videoCallStatus === "Answered"
            ) {
                if (!resStatus) {
                    const VideoCallUpdated = await VideoCall.findById(
                        newVideoCall._id
                    ).select("validity callFromUid callToUid chanelName callFromToken");

                    console.log("Send Response For Call Answered");
                    console.log(VideoCallUpdated);
                    res.status(200).json({
                        status: 200,
                        message: "Called Answered",
                        token: VideoCallUpdated,
                    });
                    resStatus = true;
                }
            } else if (
                change.operationType === "update" &&
                `${change.documentKey._id}` === `${newVideoCall._id}` &&
                change.updateDescription.updatedFields.videoCallStatus ===
                "DeclinedByFrom"
            ) {
                if (!resStatus) {
                    console.log("Send Response For Call Declined by You");
                    res.status(201).json({
                        status: 201,
                        message: "Call Declined By You",
                    });
                    reStart = true;
                }
            } else if (
                change.operationType === "update" &&
                `${change.documentKey._id}` === `${newVideoCall._id}` &&
                change.updateDescription.updatedFields.videoCallStatus ===
                "DeclinedByTo"
            ) {
                if (!resStatus) {
                    console.log("Send Response For Call Declined By Other User");
                    res.status(401).json({
                        status: 401,
                        message: "Call Declined By Other User",
                    });
                    reStart = true;
                }
            }
            await personEventEmitter.close();
        });
    } catch (error) {
        console.log(error);
        console.log("Send Response For Call Server Error");
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

exports.videoCallAnswered = async (req, res) => {
    try {
        const { callId } = req.body;
        const VideoCallUpdated = await VideoCall.findById(callId);

        VideoCallUpdated.videoCallStatus = "Answered";
        await VideoCallUpdated.save();

        VideoCallUpdated.validity = undefined;
        VideoCallUpdated.videoCallStatus = undefined;
        VideoCallUpdated.fromUser = undefined;
        VideoCallUpdated.toUser = undefined;
        VideoCallUpdated.callFromToken = undefined;
        res.status(200).json({
            status: 200,
            message: "Video call Answered successfully",
            token: VideoCallUpdated,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

exports.videoCallDeclineByFrom = async (req, res) => {
    try {
        const { callFrom } = req.body;
        const result = await VideoCall.findOne({
            fromUser: callFrom,
            validity: "Valid",
            videoCallStatus: "Waiting",
        })
            .populate({
                path: "fromUser",
                select: "name",
            })
            .populate({
                path: "toUser",
                select: "notificationsToken",
            });
        result.validity = "Expire";
        result.videoCallStatus = "DeclinedByFrom";
        await result.save();
        const msgTitle = `Missed Video Call From ${result.fromUser.name}`;
        const msgBody = `${moment(result.updatedAt).format("lll")}`;
        sendNotification(msgTitle, msgBody, result.toUser.notificationsToken, {});
        res.status(200).json({
            status: 200,
            message: "Video Call Decline By You",
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.videoCallDeclineByTo = async (req, res) => {
    try {
        const { callId } = req.body;
        const result = await VideoCall.findById(callId)
            .populate({
                path: "fromUser",
                select: "name",
            })
            .populate({
                path: "toUser",
                select: "notificationsToken",
            });
        result.validity = "Expire";
        result.videoCallStatus = "DeclinedByTo";
        await result.save();
        res
            .status(200)
            .json({ status: 200, message: "Video Call Decline Successfully" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.videoCallEnd = async (req, res) => {
    try {
        const { callId } = req.body;
        const result = await VideoCall.findById(callId);
        result.validity = "Expire";
        result.videoCallStatus = "Ended";
        await result.save();
        res.status(200).json({ status: "success", message: "Video Call ended" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

let convertGuidToInt = (uuid) => {
    // parse accountId into Uint8Array[16] variable
    // let parsedUuid = uuid.parse(uuid);
    // console.log(`uuid ${uuid} parsed successfully`);

    // convert to integer - see answers to https://stackoverflow.com/q/39346517/2860309
    let buffer = Buffer.from(uuid);
    console.log(`parsed uuid converted to buffer`);
    let result = buffer.readUInt32BE(0);
    console.log(`buffer converted to integer ${result} successfully`);

    return result;
};
// // already commented code
// exports.videoCallEnd = async (req, res) => {
//   try {
//     // const { callId } = req.body;
//     const chanelName = "samsung";
//     const callFromUid = 12345;
//     const callToUid = 54321;

//     console.log(`App ID: ${process.env.APP_ID}`);
//     console.log(`App Certificate: ${process.env.APP_CERTIFICATE}`);
//     const callFromToken = RtcTokenBuilder.buildTokenWithUid(
//       process.env.APP_ID,
//       process.env.APP_CERTIFICATE,
//       chanelName,
//       callFromUid
//     );
//     const callToToken = RtcTokenBuilder.buildTokenWithUid(
//       process.env.APP_ID,
//       process.env.APP_CERTIFICATE,
//       chanelName,
//       callToUid
//     );
//     data = {
//       ChanelName: chanelName,
//       CallFrom: callFromUid,
//       CallTo: callToUid,
//       FromToken: callFromToken,
//       ToToken: callToToken,
//     };

//     res
//       .status(200)
//       .json({ status: "success", message: "Video Call ended", data: data });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };
