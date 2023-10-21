const express = require("express");
const {
  getProfileImg,
  verifyPhotoUpload,
  uploadVideoBio,
  uploadFlippedVideoBio,
  editAndUploadFlippedVideoBio,
  getVideo,
  editAndUploadVideoBio,
  postProfile,
  getSampleVideo
} = require("../../controllers/User/userMediaController");
const { protect } = require("../../controllers/User/userAuthController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "temp/" });

// router.use(protect);

router.get("/user-profile/:key", getProfileImg);
router.get("/user-verify-selfie/:key", getProfileImg);
router.get("/user-verify-full-body/:key", getProfileImg);
router.get("/user-verify-bio-video/:key", getVideo);

router.post("/user-profile/:id", upload.single("user-profile"), postProfile);
router.post(
  "/user-verify-photos/:id",
  verifyPhotoUpload
);
router.post(
  "/user-verify-bio-video/:id",
  uploadVideoBio
);

router.get("/sample-video", getSampleVideo);
// router.post(
//   "/user-verify-bio-video-edit/:id",
//   upload.single("video-bio"),
//   editAndUploadVideoBio
// );

// router.post(
//   "/user-verify-bio-video-flipped/:id",
//   upload.single("video-bio"),
//   uploadFlippedVideoBio
// );

// router.post(
//   "/user-verify-bio-video-flipped-edit/:id",
//   upload.single("video-bio"),
//   editAndUploadFlippedVideoBio
// );

module.exports = router;
