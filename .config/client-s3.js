const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");


const JimpImg = async (uid, file, width, height) => {
  console.log("In JimpImg");
  try {
    const image = await Jimp.read(`./userMedia/${uid}/` + file.originalname);
    await image
      .resize(width, height)
      .quality(100)
      .writeAsync(file.originalname);
    return { image, filename: file.originalname };
  } catch (err) {
    console.log(err);
  }
};

exports.uploadImg = async (uid, file, width, height) => {
  try {
    console.log("In UploadImg");
    const imageBuffer = await JimpImg(uid, file, width, height);
    // get the new image buffer
    const newImageBuffer = await imageBuffer.image.getBufferAsync(
      Jimp.MIME_JPEG
    );
    console.log("newImageBuffer", newImageBuffer);
    // overwrite the existing image with the new image
    fs.writeFileSync(`./userMedia/${uid}/` + file.originalname, newImageBuffer);
    return newImageBuffer;
  } catch (error) {
    console.log("error while uplaoding image", error);
  }
};

// Upload Simple Image Without Crop or Compression

// upload Profile Verification Images
// Video Upload
exports.uploadVideo = async (file) => {
  console.log("In UploadVideo");
  try {
    const fileStream = fs.createReadStream(file.path);
    console.log(filePath);
    fs.unlinkSync(`./userMedia/${id}/${filePath}`);
    console.log(`${filePath} was deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}: ${error}`);
  }
};

exports.getFileStream = async (uid, file) => {
  return true;
  // try {
  //   // Read the processed image from disk
  //   const image = await Jimp.read(`./userMedia/${uid}/` + file.originalname);

  //   // Convert the image to a buffer and send it in the response
  //   const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
  //   // res.set("Content-Type", Jimp.MIME_JPEG);
  //   return buffer;
  // } catch (err) {
  //   console.log(err);
  //   return null
  //   // res.status(404).json({
  //   //   success: false,
  //   //   message: "The requested image could not be found",
  //   // });
  // }
};

// Delete File From S
exports.deleteFile = async (filePath, id) => {
  try {
    const mediaPath = path.join(__dirname, "../userMedia", id, filePath);
    console.log("path", mediaPath);
    fs.unlinkSync(mediaPath);
    console.log(`${filePath} was deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}: ${error}`);
  }
};
