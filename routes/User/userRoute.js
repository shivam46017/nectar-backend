const express = require("express");
const userController = require("./../../controllers/User/userController");
const { protect } = require("./../../controllers/User/userAuthController");

// const userController = require("../../controllers/Admin/adminController");
// const auth = require("../../controllers/Admin/User/auth");
const user = require("../../controllers/User/userController");

const router = express.Router();

router.patch("/iWantToSwipe/:userId", userController.iWantToSwipe);
router.patch(
  "/update/notification/token/:userId",
  userController.updateNotificationToken
)

router.patch(
  "/editDatingPreference",
  protect,
  userController.editDatingPreference
);
router.patch("/update/email", protect, userController.updateEmailId);
router.patch("/edit/profile", protect, userController.updateProfile);
router.delete("/delete/profile/:userId/:firebaseUserId", protect, userController.deleteUser);
router.post("/test/notification", protect, userController.testNotification);
router.get("/get/help/question", protect, userController.getAllQuestion);
router.get("/plans", userController.getPremiumPrice);
module.exports = router;
