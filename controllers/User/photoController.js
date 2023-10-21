// const Photo = require("../../models/User/userPhoto");
const User = require("../../models/User/userModel");
const fs = require("fs");
const path = require("path");
const { uploadImg, getFileStream } = require("../../.config/client-s3");
const multer = require("multer");




const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { uid } = req.params;
    const folderName = `./userMedia/${uid}`;

    // create folder with UID name if it doesn't exist
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).fields([{ name: "video" }, { name: "audio" }, { name: "file" }]);

exports.uploadPhoto = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        status: "not found",
        message: "User not found",
      });
    }

    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "Error", message: "Internal server error" });
      }

      console.log("In uploadPhoto");

      const file = req.files.file[0];
      console.log(file);

      const result = await uploadImg(uid, file, 480, 480);
      console.log("result", result);

      const key = file.originalname;
      console.log("key", key);
      user.photos.push({ photoKey: key });
      await user.save();

      res.status(200).json({
        status: "success",
        message: "User Verify Photos Updated.",
      });
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};


// exports.deletePhoto = async (req, res) => {
//   try {
//     const { photoKey, userId } = req.body;
//     const user = await User.findById(userId);
//     if (user) {
//       user.photos = user.photos.filter((item) => item.photoKey !== photoKey);
//       user.photos.pull({ photoKey: photoKey });
//       await user.save();
//       res
//         .status(200)
//         .json({ status: "success", message: "photos deleted successfully" });
//     } else {
//       res.status(404).json({
//         status: "not found",
//         message: "User not found",
//       });
//     }
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ status: "Error", message: "Internal server error" });
//   }
// };


exports.deletePhoto = async (req, res) => {
  try {
    const { photoKey, userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "not found",
        message: "User not found",
      });
    }

    const photoIndex = user.photos.findIndex((photo) => photo.photoKey === photoKey);

    if (photoIndex === -1) {
      return res.status(404).json({
        status: "not found",
        message: "Photo not found",
      });
    }

    const photoPath = path.join(__dirname, "../image", userId, photoKey);
    fs.unlinkSync(photoPath);

    user.photos.splice(photoIndex, 1);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.getPhotos = async (req, res) => {
  console.log("getPhotos");
  // try {
//   //   const key = req.params.key;
//   //   const readStream = getFileStream(key);
//   //   readStream.pipe(res);
//   // } catch (error) {
//   //   console.log("erro ", error);
//   // }

  try {
    const { uid } = req.params;

    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({
        status: "not found",
        message: "User not found",
      });
    }

    const photoUrls = user.photos.map((photo) => {
      return { url: `/image/${uid}/${photo.photoKey}` };
    });
    res.status(200).json({
      status: "success",
      photos: photoUrls,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// exports.createPhoto = async ({ userInput }, req) => {
//   const { viewability, photoPath, userId } = userInput;
//   const newPhoto = await Photo.create({
//     viewability,
//     photoPath,
//     user: userId,
//   });
//   const user = await User.findById(userInput.uid);
//   user.photo.push(newPhoto._id);
//   const photo = await newPhoto.save();
//   user.save();
//   return photo;
// };
// exports.getOnePhoto = async ({ userInput }, req) => {
//   const photo = await Photo.findById(userInput.photoId);
//   return photo;
// };
// exports.getUserPhoto = async ({ userInput }, req) => {
//   try {
//     const photos = [];
//     const user = await User.findById(userInput.userId);
//     for (let i = 0; i < user.photo.length; i++) {
//       photos.push(await Photo.findById(user.photo[i]));
//     }
//     return photos;
//   } catch {
//     console.log("error");
//   }
// };
// exports.editPhoto = async ({ userInput }, req) => {
//   const { viewability, photoPath } = userInput;
//   const photo = await Photo.findByIdAndUpdate(userInput.photoId, {
//     viewability: viewability,
//     photoPath: photoPath,
//   });
//   return photo;
// };

// exports.deletePhoto = async ({ userInput }, req) => {
//   const photo = await Photo.findById(userInput.photoId);
//   const user = await User.findById(photo.user);
//   user.photo.pull(userInput.photoId);
//   await user.save();
//   await Photo.findByIdAndDelete(userInput.photoId);

//   return (message = "deleted");
// };

// exports.likePhoto = async ({ userInput }, req) => {
//   const { userId, photoId } = userInput;
//   const photo = await Photo.findById(photoId);
//   photo.like.push(userId);
//   await photo.save();
//   return (message = "Liked");
// };

// exports.disLikePhoto = async ({ userInput }, req) => {
//   const { userId, photoId } = userInput;
//   const photo = await Photo.findById(photoId);
//   photo.disLike.push(userId);
//   await photo.save();
//   return (message = "disLiked");
// };
