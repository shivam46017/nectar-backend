require("dotenv").config();
const User = require("../../models/User/userModel");
const UserOTP = require("../../models/User/userOTP");
const jwt = require("jsonwebtoken");
const { verifyFirebaseToken } = require("./fireBaseAuth");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
const internalServerError = (route, res) => {
  res.status(500).json({
    status: "Error",
    message: "Internal Server Error",
    route,
  });
};

exports.checkToken = async (req, res) => {
  try {
    const token = req.body.token;
    const value = await verifyFirebaseToken(token);
    // console.log(value);
    res.status(200).json({ status: "success", message: "done", value });
  } catch (error) {
    console.log(error)
  }
};
// COnnection refused -> Server
// {} -> req.body? -> local
exports.loginWithGoogle = async (req, res) => {
  try {
    // Data is passed from the client side, and is stored in the req.body object but when i print it, it is empty
    console.log("req.body");
    console.log("req.body", req.body); // {}
    console.log(req.authToken);
    const { authToken, notificationToken, email, facebookUid, phone } = req.body;

    if(email) {
      const user = await User.findOneAndUpdate({ email })

      if(!user) return res.status(404).json({
        success: false,
        message: 'No user found'
      })
  
      const token = createSendToken(user)
  
      return res
      .status(200)
      .message({
        success: true,
        token,
        user
      })
      
    }

    if(phone) {
      const user = await User.findOneAndUpdate({ phone })

      if(!user) return res.status(404).json({
        success: false,
        message: 'No user found'
      })
  
      const token = createSendToken(user)
  
      return res
      .status(200)
      .message({
        success: true,
        token,
        user
      })
      
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: error.errorInfo });
  }
};

// Flutter is
exports.signupWithGoogle = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      authToken,
      latitude,
      longitude,
      name,
      myInterests,
      dob,
      yourStarSign,
      iIdentifyAs,
      lookingFor,
      readyFor,
      moreAboutMe,
      myIdealMatch,
      email,
      iAmCurrently,
      children,
      notificationsToken,
    } = req.body;
    console.log(req.body);
    console.log("Getting token verfication from firebase");
    const tokenValue = await verifyFirebaseToken(authToken);
    console.log("tokenValue", tokenValue);
    // console.log(authToken);
    if (tokenValue.message) {
      res
        .status(401)
        .json({ status: "unauthorized", message: tokenValue.message });
    } else {
      if (tokenValue.firebase.sign_in_provider === "facebook.com") {
        console.log("Provider is facebook");
        console.log(tokenValue.email);
        const user = await User.findOne({ email: tokenValue.facebookUid });
        if (user) {
          user.password = undefined;
          const token = createSendToken(user);
          res
            .status(200)
            .json({ status: "success", message: "successFully", user, token });
        } else {
          //create user hear
          const userId = (await User.find().count()) + 1;
          const newUser = await User.create({
            userId,
            location: { type: "Point", coordinates: [longitude, latitude] },
            name,
            myInterests,
            dob,
            yourStarSign,
            iIdentifyAs,
            lookingFor,
            readyFor,
            moreAboutMe,
            myIdealMatch,
            phone: tokenValue.phone_number,
            phoneConfirm: true,
            email,
            iAmCurrently,
            children,
            notificationsToken,
          });
          const token = createSendToken(newUser);

          res.status(201).json({
            status: "Created",
            message: "User create successfully",
            newUser,
            token,
          });
        }
      } else if (tokenValue.firebase.sign_in_provider === "google.com") {
        console.log("provider is google");
        console.log(tokenValue.email);
        const user = await User.findOne({ email: tokenValue.email });
        console.log(user); // null
        // OLd USER
        if (user) {
          user.password = undefined;
          const token = createSendToken(user);
          res
            .status(200)
            .json({ status: "success", message: "successFully", user, token });
        } else {
          //create NEW user hear
          const userId = (await User.find().count()) + 1;
          const newUser = await User.create({
            userId,
            location: { type: "Point", coordinates: [longitude, latitude] },
            name,
            myInterests,
            dob,
            yourStarSign,
            iIdentifyAs,
            lookingFor,
            readyFor,
            moreAboutMe,
            myIdealMatch,
            phone: tokenValue.phone,
            phoneConfirm: true,
            email,
            iAmCurrently,
            children,
            notificationsToken,
          });
          const token = createSendToken(newUser);

          res.status(201).json({
            status: "Created",
            message: "User create successfully",
            newUser,
            token,
          });
        }
      } else if (tokenValue.firebase.sign_in_provider === "phone") {
        console.log("provider is phone");
        console.log(tokenValue.phone_number);
        const user = await User.findOne({ phone: tokenValue.phone_number });
        if (user) {
          user.password = undefined;
          const token = createSendToken(user);
          res
            .status(200)
            .json({ status: "success", message: "successFully", user, token });
        } else {
          //create user hear
          const userId = (await User.find().count()) + 1;
          const newUser = await User.create({
            userId,
            location: { type: "Point", coordinates: [longitude, latitude] },
            name,
            myInterests,
            dob,
            yourStarSign,
            iIdentifyAs,
            lookingFor,
            readyFor,
            moreAboutMe,
            myIdealMatch,
            phone: tokenValue.phone_number ?? "0000000000",
            phoneConfirm: true,
            email,
            iAmCurrently,
            children,
            notificationsToken,
          });
          const token = createSendToken(newUser);

          res.status(201).json({
            status: "Created",
            message: "User create successfully",
            newUser,
            token,
          });
        }
      } else {
        res.status(500).json({ status: "error", message: "invalid Token " });
      }
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.checkPhone = async (req, res) => {
  try {
    const phone = req.body.phone;
    const user = await User.findOne({ phone });
    if (user) {
      res.status(200).json({ status: "success", message: "user is register" });
    } else {
      res.status(404).json({ status: "not found", message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
// working

// exports.signUpAndSendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const checkemail = await User.findOne({ email });
//     if (!checkemail) {
//       const checkOTP = await UserOTP.findOne({ email });
//       const otp =
//         `${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
//           Math.random() * 9 + 1
//         )}${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
//           Math.random() * 9 + 1
//         )}${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
//           Math.random() * 9 + 1
//         )}` * 1;
//       if (checkOTP) {
//         checkOTP.otp = otp;
//         await checkOTP.save();
//       } else {
//         await UserOTP.create({ email, otp });
//       }
//       console.log(otp);
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: "aloks.uber@gmail.com",
//           pass: "uouhiyqubhutiyqk",
//         },
//         tls: {
//           rejectUnauthorized: false
//       }
//       });
//       // // create the mail options
//       const mailOptions = {
//         from: "aloks.uber@gmail.com",
//         to: email,
//         subject: "Verification OTP",
//         text: "Your OTP is " + otp + ".",
//       };
//       // // send the mail using the transporter
//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           console.log(error);
//           return res.status(409).json({
//             status: "Conflict",
//             message: "This email id already exists",
//           });
//         } else {
//           console.log("Email sent: " + info.response);
//           console.log("Sent to: ");
//           return res.status(200).json({
//             status: "success",
//             message: "Otp Is sended to phone id and Otp is valid for 10 min",
//           });
//         }
//       });
//     } else {
//       res.status(409).json({
//         status: "Conflict",
//         message: "This email id already exists",
//       });
//     }
//   } catch (error) {
//     cosnole.log(error);
//     internalServerError("/api/v1/users//signUp/VerifyOtp", res);
//   }
// };

exports.sendOTP = async (req, res) => {

  try {

    const otp = generateOTP(); // Function to generate OTP using crypto module

    client.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: req.body.phone,
      body: `Welcome to Nectar Dating! Your OTP for verification is ${otp}.`,
    })
    .then(async (message) => {
      console.log(message.sid);
      await UserOTP.create({ email: req.body.phone, otp });
      res.status(200).json({
        status: 'success',
        message: 'OTP has been sent to the phone number. OTP is valid for 10 minutes.',
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while sending the OTP.',
      });
    });
  } catch (error) {
    console.log('---------------------------------error-----------------------------')
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while sending the OTP.',
    });
  }
}

exports.verifyOTP = async (req, res) => {
  const otp = req.body.otp.toString();

  try {
    const correctOne = await UserOTP.findOne({ email: req.body.phone, otp });
    if (correctOne) {
      await User.findOneAndUpdate({ email: req.body.phone }, { verified: true })
      res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully.',
      });
    } else {
      res.status(401).json({
        status: 'unauthorized',
        message: 'Incorrect OTP.',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

exports.signUpAndSendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkemail = await User.findOne({ email });

    if (!checkemail) {
      const otp = generateOTP(); // Function to generate OTP using crypto module
      
      let checkOTP = await UserOTP.findOne({ email });
      if (checkOTP) {
        checkOTP.otp = otp;
        await checkOTP.save();
      } else {
        await UserOTP.create({ email, otp });
      }
      
      console.log(otp);
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'aloks.uber@gmail.com', // Update with your email
          pass: 'uouhiyqubhutiyqk', // Update with your password
        },
      });
      
      const mailOptions = {
        from: 'aloks.uber@gmail.com',
        to: email,
        subject: 'Verification OTP',
        text: `Your OTP is ${otp}.`,
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return res.status(200).json({
          status: 'success',
          message: 'OTP has been sent to the email address. OTP is valid for 10 minutes.',
        });
      } catch (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({
          status: 'error',
          message: 'An error occurred while sending the email.',
        });
      }
    } else {
      return res.status(409).json({
        status: 'Conflict',
        message: 'This email id already exists',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.signUpWAndVerifyOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp * 1;

    const checkemail = await User.findOne({ email });
    if (!checkemail) {
      const userOtp = await UserOTP.findOne({ email });
      var otpDate = new Date(userOtp.updatedAt.getTime() + 10 * 60000);
      if (userOtp.otp === otp && otpDate > new Date(Date.now())) {
        res.status(200).json({
          status: "success",
          message: "Otp Is verified",
        });
      } else if (otpDate < new Date(Date.now())) {
        res.status(401).json({
          status: "unauthorized ",
          message: "OTP Expired",
        });
      } else {
        res.status(401).json({
          status: "unauthorized ",
          message: "Incorrect OTP",
        });
      }
    } else {
      res.status(409).json({
        status: "Conflict",
        message: "This email already exists",
      });
    }
  } catch (error) {
    internalServerError("/api/v1/users/signUp/SendOTP", res);
  }
};

exports.userSignup = async (req, res) => {
  // console.log(req.body);
  try {
    const {
      latitude,
      longitude,
      name,
      myInterests,
      dob,
      yourStarSign,
      iIdentifyAs,
      lookingFor,
      readyFor,
      moreAboutMe,
      myIdealMatch,
      phone,
    } = req.body;
    // const checkEmail = await User.findOne({ email });
    const user = await User.findOne({ phone });
    if (!user && name && phone) {
      const userId = (await User.find().count()) + 1;
      const newUser = await User.create({
        userId,
        location: { type: "Point", coordinates: [latitude, longitude] },
        name,
        myInterests,
        dob,
        yourStarSign,
        iIdentifyAs,
        lookingFor,
        readyFor,
        moreAboutMe,
        myIdealMatch,
        phone,
      });
      const token = createSendToken(newUser);

      res.status(201).json({
        status: "Created",
        message: "User create successfully",
        newUser,
        token,
      });
    } else {
      res.status(409).json({
        status: "Conflict",
        message: "This phone already exists",
      });
    }
  } catch (error) {
    console.log(error);
    internalServerError("/api/v1/users/userSignup", res);
  }
};

exports.signInWithOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const checkUserPhone = await User.findOne({ phone });

    if (phone && checkUserPhone) {
      const userOtp = await UserOTP.findOne({ phone });
      var otpDate = new Date(userOtp.updatedAt.getTime() + 10 * 60000);
      if (userOtp.otp === otp && otpDate > new Date(Date.now())) {
        const user = await User.findOne({ phone });
        token = signToken(user._id);
        res.status(200).json({
          status: "success",
          message: "Login successfully",
          user,
          token,
        });
      } else if (otpDate < new Date(Date.now())) {
        res.status(401).json({
          status: "unauthorized ",
          message: "OTP Expired",
        });
      } else {
        res.status(401).json({
          status: "unauthorized ",
          message: "Incorrect OTP",
        });
      }
    } else {
      res.status(404).json({
        status: "not found",
        message: "Phone Number not  not found, please signup",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.signInAndSendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (email) {
      const checkEmail = await User.findOne({ email });
      if (checkEmail) {
        const checkOTP = await UserOTP.findOne({ email });
        const otp =
          `${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
            Math.random() * 9 + 1
          )}${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
            Math.random() * 9 + 1
          )}` * 1;
        if (checkOTP) {
          checkOTP.otp = otp;
          await checkOTP.save();
        } else {
          await UserOTP.create({ email, otp });
        }

        console.log(otp);

        res.status(200).json({
          status: "success",
          message: "Otp Is sent to Email id and Otp is valid for 10 min",
        });
      } else {
        res.status(404).json({
          status: "not found",
          message: "user Not found",
        });
      }
    } else if (phone) {
      const checkPhone = await User.findOne({ phone });
      if (checkPhone) {
        const checkOTP = await UserOTP.findOne({ phone });

        const otp =
          `${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
            Math.random() * 9 + 1
          )}${Math.trunc(Math.random() * 9 + 1)}${Math.trunc(
            Math.random() * 9 + 1
          )}` * 1;
        if (checkOTP) {
          checkOTP.otp = otp;

          await checkOTP.save();
        } else {
          await UserOTP.create({ phone, otp });
        }
        console.log(otp);
        res.status(200).json({
          status: "success",
          message: "Otp Is sent to phone id and Otp is valid for 10 min",
        });
      } else {
        res.status(404).json({
          status: "not found",
          message: "user Not found",
        });
      }
    }
  } catch (error) {
    internalServerError("/api/v1/users//signUp/VerifyOtp", res);
  }
};

exports.signInWithPassword = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (email) {
      if (!email || !password) {
        res.status(404).json({
          status: "success",
          message: "enter password or email",
        });
      }
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password))) {
        res.status(403).json({
          data: "Invalid password or Admin name",
        });
      } else {
        user.password = undefined;
        const token = signToken(user._id);
        res.status(200).json({
          status: "success",
          message: "login Successfully",
          user,
          token,
        });
      }
    } else if (phone) {
      if (!phone || !password) {
        res.status(404).json({
          status: "success",
          message: "enter password or phone",
        });
      }
      const user = await User.findOne({ phone }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password))) {
        res.status(403).json({
          data: "invalid password or Admin name",
        });
      } else {
        const token = signToken(user._id);
        res.status(200).json({
          status: "success",
          message: "login Successfully",
          user,
          token,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

exports.signInCheckEmailOrPhone = async (req, res) => {
  const { email, phone } = req.body;
  if (email) {
    const checkEmail = await User.find({ email });
    if (checkEmail) {
      res.s;
    }
  } else if (phone) {
  }
};

exports.signInForgetPassword = async (req, res) => {
  try {
    
  
  const { email, phone, password, passwordConfirm, otp } = req.body;
  const checkUserEmail = await User.findOne({ email });
  const checkUserPhone = await User.findOne({ phone });

  if (checkUserEmail && email) {
    const userOtp = await UserOTP.findOne({ email });
    var otpDate = new Date(userOtp.updatedAt.getTime() + 10 * 60000);
    if (userOtp.otp === otp && otpDate > new Date(Date.now())) {
      const user = await User.findOne({ email }).select("+password");
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "successfully changed password",
      });
    } else if (otpDate < new Date(Date.now())) {
      res.status(401).json({
        status: "unauthorized ",
        message: "OTP Expired",
      });
    } else {
      res.status(401).json({
        status: "unauthorized ",
        message: "Incorrect OTP",
      });
    }
  } else if (phone && checkUserPhone) {
    const userOtp = await UserOTP.findOne({ phone });
    var otpDate = new Date(userOtp.updatedAt.getTime() + 10 * 60000);
    if (userOtp.otp === otp && otpDate > new Date(Date.now())) {
      const user = await User.findOne({ phone }).select("+password");
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "successfully changed password",
      });
    } else if (otpDate < new Date(Date.now())) {
      res.status(401).json({
        status: "unauthorized ",
        message: "OTP Expired",
      });
    } else {
      res.status(401).json({
        status: "unauthorized ",
        message: "Incorrect OTP",
      });
    }
  } else {
    res.status(404).json({
      status: "not found",
      message: "Phone Number not found, please signup",
    });
  }
} catch (error) {
    console.log("error (while forgeting password)", error);
}
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user) => {
  return (token = signToken(user._id));
};

exports.dashboard = async (req, res) => {
  try {
    const user = await req.user;
    // console.log(user);
    res.status(200).json({ status: "success", message: "Successfully", user });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    console.log(req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // console.log(token);
      if (!token) {
        res.status(401).json({
          status: "unauthorized",
          message: "you are not logged in ! please log in to get access",
        });
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          res.status(404).json({
            status: "not found",
            message: "User not found",
          });
        } else {
          req.user = currentUser;

          next();
        }
      }
    }
    // console.log("hello form auth.protect");
  } catch (error) {
    // console.log(error);
    res.status(401).json({
      status: "unauthorized",
      message: "you are not logged in ! please log in to get error access",
    });
  }
};

exports.addFacebookUid = async (req, res) => {
  try {
    const { facebookUid, userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { facebookUid });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: error.errorInfo });
  }
};
