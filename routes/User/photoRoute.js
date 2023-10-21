const express = require("express");
const photoController = require("../../controllers/User/photoController");
const router = express.Router();
const { protect } = require("../../controllers/User/userAuthController");

// Protect routes that require authentication
// router.use(protect);

// Upload a photo for a user
// router.post("/uploadPhoto/:id",  photoController.uploadPhoto);
router.post("/uploadPhoto/:uid", photoController.uploadPhoto);

// Delete a photo
router.delete("/delete/:uid/:key", photoController.deletePhoto);

// Get photos for a user
router.get("/getphotos/:uid", photoController.getPhotos);


module.exports = router;
