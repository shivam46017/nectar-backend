const Notifications = require("./../../models/Admin/NotificationsModel");
const {
  sendNotificationToAllWithImage,
  sendNotificationToAll,
} = require("./../User/fireBaseAuth");

exports.createNotifications = async (req, res) => {
  try {
    const { title, image, message } = req.body;
    console.log(req.body);
    const notifications = await Notifications.create({ title, message });
    console.log("notifications");
    if (!image) {
      sendNotificationToAll(notifications.title, notifications.message);
    }
    res.status(200).json({
      status: "success",

      message: "Successfully sent notifications",

      notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
exports.getallNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.find().sort({ _id: -1 }).limit(5);
    res.status(200).json({
      status: "success",
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
