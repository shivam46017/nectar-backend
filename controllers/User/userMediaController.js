const User = require("../../models/User/userModel");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const {
  uploadImg,
  uploadVideo,
  uploadVideoWithPath,
  getFileStream,
  deleteFile,
} = require("../../.config/client-s3");
const multer = require("multer");
const sampleVideo = require("../../models/User/sampleVideo");
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    const folderName = `./userMedia/${id}`;
console.log("folderName", folderName);
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
}).fields([{ name: "selfie" }, { name: "fullBody" }, { name: "video-bio" }]);

exports.verifyPhotoUpload = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "Error", message: "Internal server error" });
      }

      console.log("In verifyPhotoUpload");

      const file1 = req.files["selfie"][0];
      const file2 = req.files["fullBody"][0];
      const { id } = req.params;
      const userText = await User.findById(id);
      if (userText) {
        const selfieData = await uploadImg(id, file1, 480, 480);
        const fullBodyData = await uploadImg(id, file2, 480, 480);
      
        userText.selfie = file1.originalname;
        userText.fullBody = file2.originalname;
        userText.photos.insert(0, { photoKey: file1.filename });
        userText.photos.insert(1, { photoKey: file2.filename });

        await userText.save();
        res.status(200).json({
          status: "success",
          message: "User Verify Photos Updated.",
          data: userText,
        });
      } else {
        res.status(404).json({
          status: "not found",
          message: "User not found",
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  }
};

exports.getProfileImg = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", message: "invalid Key" });
  }
};

exports.uploadVideoBio = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "Error", message: "Internal server error" });
      }
      const file = req.files["video-bio"][0];
      console.log("file", file);
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: "not found",
          message: "User not found",
        });
      }

      // If user has a previous videoBio, delete it
      if (user.videoBio) {
        console.log("videoBio", user.videoBio);
        await deleteFile(user.videoBio, id); // Implement this function as per your requirements
        user.videoBio = null;
      }

      // Save the new videoBio file
      // user.videoBio = `./userMedia/${id}/${file.filename}`;
      user.videoBio = file.filename;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Video Uploaded Successfully",
        data: user,
        videoBio: file.filename,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.editAndUploadVideoBio = async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    const { id } = req.params;
    const userText = await User.findById(id);
    if (userText) {
      if (userText.videoBio) {
        await deleteFile(userText.videoBio);
      }
      const results = await uploadVideo(file);
      console.log(results);
      userText.videoBio = results.Key;
      userText.videoBioVerifyed = false;
      userText.userVerifyed = false;

      await userText.save();
      fs.unlinkSync(file.path);
      res.status(200).json({
        status: "success",
        message: "Video Uploaded SuccessFully",
        data: userText,
        videoBio: results.Key,
      });
    } else {
      res.status(404).json({
        status: "not found",
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Get Video
exports.getVideo = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
exports.postProfile = async (req, res) => {
  try {
    const file = req.file;
    const { id } = req.params;
    const userText = await User.findById(id);
    if (userText.profilePhoto) {
      userText.oldProfilePhotos.push(userText.profilePhoto);
    }
    const width = 480;
    const height = 480;
    const results = await uploadImg(id, file, width, height);
    userText.profilePhoto = results.key;
    await userText.save();
    fs.unlinkSync(file.path);
    res.json({ status: "success", message: "User Profile Updated" });
  } catch (e) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.uploadFlippedVideoBio = async (req, res) => {
  try {
    const file = req.file;
    const { id } = req.params;
    const userText = await User.findById(id);
    if (userText) {
      if (userText.videoBio) {
        await deleteFile(userText.videoBio);
      }
      const conv = new ffmpeg({ source: file.path });
      const output = await conv
        .on("start", function (commandLine) {
          console.log("Spawned FFmpeg with command: " + commandLine);
        })
        .on("error", function (err) {
          console.log("error: ", +err);
        })
        .on("end", async (err) => {
          if (!err) {
            console.log("conversion Done");
            const results = await uploadVideoWithPath(
              file.filename,
              `${file.path}.mp4`
            );
            console.log(results);
            userText.videoBio = results.Key;
            await userText.save();
            fs.unlinkSync(file.path);
            fs.unlinkSync(`${file.path}.mp4`);
            res.status(200).json({
              status: "success",
              message: "Video Uploaded SuccessFully",
              data: userText,
              videoBio: results.Key,
            });
          }
        })
        .outputOptions(["-vf hflip"])
        .saveToFile(`./temp/${file.filename}.mp4`);
    } else {
      res.status(404).json({
        status: "not found",
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// exports.editAndUploadFlippedVideoBio = async (req, res) => {
//   try {
//     const file = req.file;
//     const { id } = req.params;
//     const userText = await User.findById(id);
//     if (userText) {
//       if (userText.videoBio) {
//         await deleteFile(userText.videoBio);
//       }
//       const conv = new ffmpeg({ source: file.path });
//       const output = await conv
//         .on("start", function (commandLine) {
//           // console.log("Spawned FFmpeg with command: " + commandLine);
//         })
//         .on("error", function (err) {
//           // console.log("error: ", +err);
//         })
//         .on("end", async (err) => {
//           if (!err) {
//             console.log("conversion Done");
//             const results = await uploadVideoWithPath(
//               file.filename,
//               `${file.path}.mp4`
//             );
//             console.log(results);
//             userText.videoBio = results.Key;
//             userText.videoBioVerifyed = false;
//             userText.userVerifyed = false;
//             await userText.save();
//             fs.unlinkSync(file.path);
//             fs.unlinkSync(`${file.path}.mp4`);
//           }
//         })
//         .outputOptions(["-vf hflip"])
//         .saveToFile(`./temp/${file.filename}.mp4`);
//       res.status(200).json({
//         status: "success",
//         message: "Video Uploaded SuccessFully",
//         data: userText,
//       });
//     } else {
//       res.status(404).json({
//         status: "not found",
//         message: "User not found",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Internal server error" });
//   }
// };


exports.getSampleVideo = async (req, res) => {
  try {
   const video= await sampleVideo.find()
    res.status(200).json({
      status: "success",
      data: video,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}