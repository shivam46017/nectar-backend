const express = require("express");
const userLikeAndMatchController = require("./../../controllers/User/userLikeAndMatchController");
const router = express.Router();
const { protect } = require("./../../controllers/User/userAuthController");

router.patch("/likeUser", protect, userLikeAndMatchController.likeUser);
router.get("/admirers/:userId", protect, userLikeAndMatchController.admirers);
router.get("/matchList/:userId", protect, userLikeAndMatchController.matchList);
router.get(
  "/update/expireTime/:relationshipId",
  protect,
  userLikeAndMatchController.updateExpireTime
);
router.delete(
  "/delete/relationship/:relationshipId",
  protect,
  userLikeAndMatchController.deleteRelationship
);

module.exports = router;
