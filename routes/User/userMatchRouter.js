const express = require("express");
const userMatchController = require("./../../controllers/User/userMatchController");
const router = express.Router();
const { protect } = require("./../../controllers/User/userAuthController");

router.get(
  "/getUserList/:userId/:page/:limit",
  // protect,
  userMatchController.getUsersToShowOnInlimit
);

router.patch("/skippedUser", protect, userMatchController.skippedUser);
router.patch("/UnSkippedUser", protect, userMatchController.UnSkippedUser);

router.patch("/likeUser", userMatchController.likeUser); // not working
router.patch("/matchUser", protect, userMatchController.matchUser);
router.patch("/unMatchUser", protect, userMatchController.unMatchUser);
router.patch("/findMyMateADate", protect, userMatchController.findMyMateADate);

router.get(
  "/getRecommendedList/:userId",
  protect,
  userMatchController.getRecommendedList
);
router.get(
  "/getReferredList/:userId",
  protect,
  userMatchController.getReferredList
);
router.post(
  "/getUserDetailsByPhone",
  protect,
  userMatchController.getUserDetailsByPhone
);

router.get("/likedList/:userId", protect, userMatchController.getUsersLiked);  // not working
router.get(
  "/matchesList/:userId",
  protect,
  userMatchController.getUsersMatches
);
router.get("/whoLikedYou/:userId", protect, userMatchController.whoLikedYou); // not working
router.get("/getUser/:userId", protect, userMatchController.getUser);

module.exports = router;
