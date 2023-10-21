const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "userMedia/" });
const {
  getImg,
  postProfileImg,
  uploadVideo,
  uploadVideoFlipped,
  getVideo,
  postBlogImg,
  postNotiImg,
} = require("../../controllers/Media/adminProfileController");

router.get("/admin-profile/:key", getImg);
router.post("/admin-profile/:id",  postProfileImg);

router.get("/video/:key", getVideo);
router.post("/upload_video",  uploadVideo);
router.post("/upload_video-flip",  uploadVideoFlipped);

router.get("/blog-get-img/:key", getImg);
// router.post("/blog-post-img/:id", upload.single("blogImg"), postBlogImg);

router.get("/notification-img/:key", getImg);
// router.post("/notification-img/:id", upload.single("notiImg"), postNotiImg);

module.exports = router;
