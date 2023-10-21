// const { admin } = require("./fireBaseAuth");
// exports.sendNotification = (mgsTitle, mgsBody, token, data) => {
//   var payload = {
//     notification: {
//       title: mgsTitle,
//       body: mgsBody,
//     },
//   };

//   var options = data;
//   admin
//     .messaging()
//     .sendToDevice(token, payload, options)
//     .then(function (response) {
//       console.log("Successfully sent message:", response);
//     })
//     .catch(function (error) {
//       console.log("Error sending message:", error);
//     });
// };

// exports.sendNotificationToAll = (mgsTitle, mgsBody, token, data) => {
//   var payload = {
//     notification: {
//       title: mgsTitle,
//       body: mgsBody,
//     },
//   };

//   var options = data;
//   admin
//     .messaging()
//     .sendToDevice(token, payload, options)
//     .then(function (response) {
//       console.log("Successfully sent message:", response);
//     })
//     .catch(function (error) {
//       console.log("Error sending message:", error);
//     });
// };

// exports.sendNotificationToAllWithImage = (mgsTitle, mgsBody, image) => {
//   // console.log(mgsTitle, mgsBody, image);
//   var payload = {
//     notification: {
//       title: mgsTitle,
//       body: mgsBody,
//       image: image,
//     },
//   };
//   const topic = "nectar-dating-app";

//   admin
//     .messaging()
//     .sendToTopic(topic, payload)
//     .then(function (response) {
//       console.log("Successfully sent message:", response);
//     })
//     .catch(function (error) {
//       console.log("Error sending message:", error);
//     });
// };
