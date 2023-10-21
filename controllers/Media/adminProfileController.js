const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const {
  uploadImg,
  uploadVideo,
  getFileStream,
  deleteFile,
} = require("../../.config/client-s3");
const {
  sendNotificationToAllWithImage,
  sendNotificationToAll,
} = require("./../User/fireBaseAuth");
// Import Models:-
const Admin = require("../../models/Admin/adminModel");
const Blog = require("../../models/Admin/BlogModel");
const Notifications = require("../../models/Admin/NotificationsModel");
const multer = require("multer");

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    const folderName = `./userMedia/${id}`;

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
}).fields([{ name: "avatar" }, { name: "video" }]);

exports.postProfileImg = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      const file = req.files.avatar[0];
      console.log(file);
      const { id } = req.params;
      const adminText = await Admin.findById(id);
      if (adminText.photo) {
        await deleteFile(adminText.photo);
      }
      const width = 480;
      const height = 480;
      const results = await uploadImg(id, file, width, height);
      adminText.photo = file.originalname;
      await adminText.save();
      // fs.unlinkSync(file.path);
      res.json({ message: "Admin Profile Updated" });
    });
  } catch (e) {
    console.log(e);
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      const file = req.file;
      const results = await uploadVideo(file);
      res.status(200).json({
        status: "success",
        message: "Video Uploaded SuccessFully",
        video: results,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
exports.uploadVideoFlipped = async (req, res) => {
  try {
    const file = req.file;
    const output = await videoFlip(file);
    console.log(output);
    // const file2 = fs.readFileSync(output._outputs[0].target);
    // console.log(file2);
    const results = await uploadVideo(file);
    res.status(200).json({
      status: "success",
      message: "Video Flipped SuccessFully",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getVideo = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
  }
};
exports.getImg = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
  }
};
