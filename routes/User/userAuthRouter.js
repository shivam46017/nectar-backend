const express = require("express");
const userAuthController = require("./../../controllers/User/userAuthController");
const router = express.Router();

router.post("/sendOTP", userAuthController.sendOTP);
router.post("/verifyOTP", userAuthController.verifyOTP);

router.post("/signUp/SendOTP", userAuthController.signUpAndSendOTP);
router.post("/signUp/verify/otp", userAuthController.signUpWAndVerifyOtp);
router.post("/phone/check", userAuthController.checkPhone);

router.post("/signUp", userAuthController.userSignup);
router.post(
  "/add/facebookUid",
  userAuthController.protect,
  userAuthController.addFacebookUid
);
router.post("/signIn/sendOtp", userAuthController.signInAndSendOTP);
router.post("/signIn/withOtp", userAuthController.signInWithOtp);
router.post("/signIn/withPassword", userAuthController.signInWithPassword);
router.post("/signIn/forgetPassword", userAuthController.signInForgetPassword);
router.post("/login/google", userAuthController.loginWithGoogle);
router.post("/signup/google", userAuthController.signupWithGoogle);
router.post("/checkToken", userAuthController.checkToken);
router.get(
  "/dashboard",
  userAuthController.protect,
  userAuthController.dashboard
);

module.exports = router;