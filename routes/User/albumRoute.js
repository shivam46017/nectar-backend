const express = require("express");
const albumController = require("../../controllers/User/albumController");
const { protect } = require("./../../controllers/User/userAuthController");
const router = express.Router();

router.post("/createAlbum", protect, albumController.createAlbum);
router.post("/addPhotoInAlbum/:aid", protect, albumController.addPhotoInAlbum);
router.post(
  "/deletePhotoInAlbum/:aid",
  protect,
  albumController.deletePhotoInAlbum
);

router.post("/likeAlbum/:aid", protect, albumController.likeAlbum);
router.post("/disLikeAlbum/:aid", protect, albumController.disLikeAlbum);
router.get("/getOneAlbum/:aid", protect, albumController.getOneAlbum);
router.get("/getUserAlbum/:uid", protect, albumController.getUserAlbum);
router.patch("/editAlbum/:aid", protect, albumController.editAlbum);
router.delete("/deleteAlbum/:aid", protect, albumController.deleteAlbum);

module.exports = router;
