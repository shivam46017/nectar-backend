const meetingController = require("../../controllers/User/RealTime_Activity/meetingController");

const express = require("express");
const router = express.Router();

router.post("/startMeeting", meetingController.startMeeting);
router.post("/joinMeeting", meetingController.joinMeeting);
router.get("/meeting/join", meetingController.checkMeetingExisits);
router.get("/meeting/users", meetingController.getAllMeetingUsers);

module.exports = router;
