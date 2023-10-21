const express = require("express");
const {
  // generateTokenForVideoCallingPublisher,
  // generateTokenForVideoCallingSubscriber,
  videoCallToken,
  videoCallAnswered,
  videoCallEnd,
  videoCallDeclineByFrom,
  videoCallDeclineByTo,
  generateTokenForLiveStreamsPublisher,
  generateTokenForLiveStreamsSubscriber,
  checkUserAndUpdateToken,
  liveTokenList,
  CallTokenExpire,
} = require("../../controllers/User/RealTime_Activity/videoCallingController");
const router = express.Router();

// const nocache = (_, resp, next) => {
//   resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
//   resp.header("Expires", "-1");
//   resp.header("Pragma", "no-cache");
//   next();
// };




// old code for video call
router.post("/token/generate/video-call/callStart", videoCallToken);
router.post(
  "/token/generate/video-call/callAnswered",
  videoCallAnswered
);
router.post("/token/generate/video-call/callEnd", videoCallEnd);
router.post("/token/generate/video-call/callEndByFrom", videoCallDeclineByFrom);
router.post("/token/generate/video-call/callEndByTo", videoCallDeclineByTo);
router.post(
  "/token/generate/live-streams/publisher",
  generateTokenForLiveStreamsPublisher
);
router.post(
  "/token/generate/live-streams/subscriber",
  generateTokenForLiveStreamsSubscriber
);

router.post("/token/generate/list/live-streams/", liveTokenList);


router.post("/token/generate/room-token", checkUserAndUpdateToken);

router.post("/token/expire", CallTokenExpire);

// router.post(
//   "/token/generate/rtm-token/publisher",
//   nocache,
//   generateTokenForRealTimeMessagingPublisher
// );
// router.post(
//   "/token/generate/rtm-token/subscriber",
//   nocache,
//   generateTokenForRealTimeMessagingSubscriber
// );
module.exports = router;
