require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const userAuthRouter = require("./routes/User/userAuthRouter");
const adminRouter = require("./routes/Admin/adminRoute");
const adminUser = require("./routes/Admin/user");
const diaryRouter = require("./routes/User/diaryRoute");
const photoRoute = require("./routes/User/photoRoute");
const albumRoute = require("./routes/User/albumRoute");
const userRoutes = require("./routes/User/userRoute");
const plansRouter = require("./routes/Plans/plansRouter");
const questionsRouter = require("./routes/User/questionsRouter");
const userMatchRouter = require("./routes/User/userMatchRouter");
const userActivityRouter = require("./routes/User/realTimeActivityRoute");
const userLikeAndMatchRouter = require("./routes/User/userLikeAndMatchRouter");
const communityQuestionRouter = require("./routes/User/communityQuestionRouter");
const bodyParser = require("body-parser");
const blogRouter = require("./routes/Admin/blogRouter");
const notificationsRouter = require("./routes/Admin/notificationsRouter");
const adminUserRouters = require("./routes/Admin/adminUserRouters");
const adminMedia = require("./routes/media/adminProfileRoute");
const userMedia = require("./routes/User/userMediaRoute");
const transactionRouter = require("./routes/User/transactionRouter");
const crashRouter = require("./routes/crash/crashRoute");

const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const { protect } = require("./controllers/User/userAuthController");
const cookieParser = require("cookie-parser");
const swaggerJSDocs = YAML.load("./api.yaml");


app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use("/usermedia", express.static(path.join(__dirname, "userMedia")));
app.use(cookieParser());
const DB = process.env.DATABASE;
mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb+srv://demodata:123@cluster0.p5xvkx8.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DB connection successful!"))
  .catch((e) => {
    console.log(`SomeThing went wrong with DataBase. and the error is =  ${e}`);
  });

app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());

// app.get("/", (req, res) => res.send("<h1>Server is running</h1>"));

// admin router
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/user", adminUser);
app.use("/api/v1/admin/user", adminUserRouters);
app.use("/api/v1/admin/blog", blogRouter);
app.use("/api/v1/admin/notifications", notificationsRouter);

// user Router
app.use("/api/v1/users", userAuthRouter);
app.use("/api/v1/users", diaryRouter);
app.use("/api/v1/users", photoRoute);
app.use("/api/v1/users", albumRoute);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/users", transactionRouter);

// user questionsRouter
app.use("/api/v1/users", questionsRouter);

// user userMatchRouter
app.use("/api/v1/users", userMatchRouter);

// Media Router
app.use("/api/v1/user-media", userMedia);
app.use("/api/v1/media", adminMedia);

// Plans Router
app.use("/api/v1/plans", plansRouter);

// User Activity Router
app.use("/api/v1/activity", userActivityRouter);

// create crash report 
app.use("/api/v1/crash", crashRouter);

app.use("/api/v1/users/new", userLikeAndMatchRouter);
app.use("/api/v1/users/", communityQuestionRouter);

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

app.get('/api/v1/agora/token', nocache, (req, res) => {

  try {
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = req.query.channelName;
    const uid = req.query.uid;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    
    if (!channelName) {
      return res.status(500).json({ 'error': 'channel is required' });
    } else if (!uid) {
      return res.status(500).json({ 'error': 'uid is required' });
    }
  
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    return res.status(201).json({ 'token': token });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ 'error': error });
  }

})

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("*", (req, res) => {
  res.status(404).json({
    status: "success",
    message: "Url not found",
  });
});
app.post("*", (req, res) => {
  res.status(404).json({
    status: "success",
    message: "Url not found",
  });
});

const port = process.env.PORT || 8081;


// const io = new Server(8000, {
//   cors: true,
// });

// const emailToSocketIdMap = new Map();
// const socketidToEmailMap = new Map();

// io.on("connection", (socket) => {
//   console.log(`Socket Connected`, socket.id);
//   socket.on("room:join", (data) => {
//     const { userId, room } = data;
//     emailToSocketIdMap.set(userId, socket.id);
//     socketidToEmailMap.set(socket.id, userId);
//     console.log(`user:joined`, userId, socket.id);
//     // broadcast msg for those who are in the room
//     io.to(room).emit("user:joined", { userId, id: socket.id });
//     socket.join(room);
//     io.to(socket.id).emit("room:join", data);
//   });

//   socket.on("user:call", async ({ to, offer }) => {
//     console.log(`user:call`, socket.id, to, offer);
//     const user = await User.findOne({id: to});
//     sendNotification(
//       "Call Notification",
//       "You have a call from " + socketidToEmailMap.get(socket.id),
//       user.notificationsToken,
//       {
//         roomId: offer.roomId,
//       }
//     );
//     // find and send notification to the user // only notification is pending
//     io.to(to).emit("incomming:call", { from: socket.id, offer });
//     console.log(`incomming:call`, socket.id, offer);
//   });

//   socket.on("call:accepted", ({ to, ans }) => {
//     console.log(`call:accepted`, socket.id, to, ans);
//     // send notification to the call initiator // call started
//     io.to(to).emit("call:accepted", { from: socket.id, ans });
//   });

//   socket.on("peer:nego:needed", ({ to, offer }) => {
//     io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//   });

//   socket.on("peer:nego:done", ({ to, ans }) => {
//     io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//   });
// });

app.listen(port, () => console.log(`Server is running on port ${port}!`));
