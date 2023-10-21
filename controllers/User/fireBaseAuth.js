const admin = require("firebase-admin");
const { getFirestore, getMessaging } = require("firebase-admin/firestore");

const secretAccessKey = {
  type: "service_account",
  project_id: "nectar-dating",
  private_key_id: "111e25d575a0a6a00dae34f9c9ca92394692333d",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHKUNsGeYo8yrA\nc5rCi5rHmPlBesa73RP4SZL2eid7H30gztLnrEZ/qQqevCGRwJ7do6DPvJ3YMaVQ\n0ZevNh7qUgUbX5bc8rWs1/vRuI7uBQBvYKAZ3DfemMNCqNcHddFPfPStiXjgTJlg\n3bMZi+UAUgMETeao2e74B0P8z7xpzZ0xBpXUrHQAM0b4gI7ChbZD+HVbICPMRAf7\nVzSq21DvYBok3NG3bYU3PQgPn3i0oj+LXBkojeF0fIVFtf0fIVTmBJm+0EF0HBVJ\nZ6cEOcUxU4nfws4oQyxVEI1KUYGbQyaYZCaJ1m4IH5u3mJuplIGkjZQWYKLerPR4\nLltfWXezAgMBAAECggEAK1bl5qDOLqwX6hBeJabGlFfMKf0jQR9vaJDuK7fSXp8w\nFhMb3zFkmAQ7nOZYscSGbbndVUd42+KV1Hv/s6+l05zsopPPGx6v/UB0+qLca5xo\nB1SyEl6TQ9vfZeKjBGsVlOQexKLNTJYurF8iSdVhDIxMPsQLBUSDlbLTDzFPkYA8\nRgM69JycfpntwSJDuUe4Zh8Oza5865ee2OI52O0xsL4AH7zoT3Ddq8jbp6qxvsSi\nOGVbaAfJdAkbn8EkehsW87Ni+QO+bIyRbs3UdMWtynqA/aHYpqas+RO+BC/sgR/h\nsq2Vbim9Z5zsBr+oXOedeG+JpkvH6DNFPUvKylZ5kQKBgQDiklU+GsSlllAhu8rx\ns/9jp2FeBjaZlYpQ/JBQjvyKRIt1sA54g0lMQxy3530eY9BiJ6xFHBuh5opF07ai\neIW8bMx6V6T2MusTz895Cgk4B7hi+ylL079/Nj3zeF7OusPX12ujHrjOfzSpEQON\nnWvEGBDY+j8UNsIBDuegDGA8owKBgQDhB4Oh6wsoYuWgDYbBqCeIQmYo3W3S4Cry\ne5yhsIajKZoiqVQUCNCiYft4kA+WUxxSyN863uTDZ06QYuDhDNffQXxuDfg1SXwT\nI/dZHD+HqGun2Kys0Z96ryPli5Vcr+YIObopHUeUwhxmFjsID1Y2CkQGIv1I5qIl\nHWGesyf5sQKBgGn+MRibpzEbz6LoWnmWTjyNejRlTbetyIY4kT7OlYANrvxAf5SL\nPogJwW6bQeIsqbixfJrcGmU0F62w7Hi3T0El2MbHJ6nxih27kwC53DQ1EGJlwxzx\nE13svzCeOCQYJTRdV8J4xdX8lmMdTX87jMWwyHjpIQdQ0pNyKJOsFn1nAoGBAM2w\n8aiS0YskAyMu2guwahpKH1mhNZ75Gyi0xvKhCiCgiWy/fMQnXpXfnF6SyDyvUYd2\nZ15HmbHnf0/Joib0d2pyUIvEpyoGNqzERncktAmLcIRnMUdzASTCbLyIv4mOm2TP\nZ5PnWKPoXs8N6P2wDyysa4t0djMp5fKpDa9jsdmxAoGBAOInN0hECQzno7DKciyz\ndqXYvPFZ515t4wTK0AKVzuGevwJUQ7bTmMBl14kLM27RobidFXJ3Vv1KW4g76N+0\nIHz5l6ngnY9Kc7+d6J0DXb7CEqz0F4fKUtNPVCn7yqZ5u6PeOQ+YZphzPBX8fUah\nb2L1N0jBWP/Au3BVmJeLX5Ba\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-kqiu0@nectar-dating.iam.gserviceaccount.com",
  client_id: "114912187633692307845",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kqiu0%40nectar-dating.iam.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(secretAccessKey),
});

exports.db = getFirestore();

exports.verifyFirebaseToken = async (tokenKey) => {
  try {
    console.log(tokenKey);
    const decodeValue = await admin.auth().verifyIdToken(tokenKey);
    if (decodeValue) {
      return decodeValue;
    }
    return "UnAuthorize";
  } catch (e) {
    console.log(e);
    return e;
  }
};

exports.sendNotification = (mgsTitle, mgsBody, token, data) => {
  try {
    console.log(mgsTitle, mgsBody, token, data);
    var payload = {
      notification: {
        title: mgsTitle,
        body: mgsBody,
      },
      data,
    };
    const registrationToken = token;
    var options = data;
    admin
      .messaging()
      .sendToDevice(registrationToken, payload, options)
      .then(function (response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function (error) {
        console.log("Error sending message:", error);
      });
  } catch (error) {
    console.log("error while sending notification", error);
  }
};

exports.sendNotificationToAll = (mgsTitle, mgsBody) => {
  try {
    var payload = {
      notification: {
        title: mgsTitle,
        body: mgsBody,
      },
    };
    const topic = "nectar-dating-app";
    admin
      .messaging()
      .sendToTopic(topic, payload)
      .then(function (response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function (error) {
        console.log("Error sending message:", error);
      });
  } catch (error) {
    console.log("error while sending notification", error);
  }
};

exports.sendNotificationToAllWithImage = (mgsTitle, mgsBody, image) => {
  // console.log(mgsTitle, mgsBody, image);
  try {
    var payload = {
      notification: {
        title: mgsTitle,
        body: mgsBody,
        image: image,
      },
    };
    const topic = "nectar-dating-app";
  
    admin
      .messaging()
      .sendToTopic(topic, payload)
      .then(function (response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function (error) {
        console.log("Error sending message:", error);
      });
  } catch (error) {
    console.log("error while sending notification (sendNotificationToAllWithImage)", error);
  }
 
};
