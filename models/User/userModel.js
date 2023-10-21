const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    profilePhoto: {
      type: String,
      default: "",
    },
    userId: {
      type: Number,
      // unique: true,
    },
    notificationsToken: {
      type: String,
    },
    name: {
      type: String,
      default: "",
      // required: true,
    },
    dob: {
      type: String,
      default: "",
      // required: true,
    },
    iIdentifyAs: {
      type: String,
      default: "",
      // gender
      // required: true,
    },
    myInterests: {
      type: Array,
    },
    lookingFor: {
      type: String,
      default: "",
    },

    facebookUid: {
      type: String,
      default: "",
    },
    yourStarSign: {
      type: String,
      default: "",
    },
    readyFor: {
      type: String,
      default: "",
    },
    moreAboutMe: {
      traditional: Number,
      spontaneous: Number,
      spiritual: Number,
      socialButterfly: Number,
      height: Number,
      age: Number,
      smoker: { type: String, enum: ["Yes", "No", "Socially"] },
      drinker: { type: String, enum: ["Yes", "No", "Socially"] },
    },
    iAmCurrently: {
      type: String,
    },
    children: {
      type: String,
      default: "",
    },
    myIdealMatch: {
      traditional: Number,
      spontaneous: Number,
      spiritual: Number,
      socialButterfly: Number,
      smoker: { type: String, enum: ["Yes", "No", "Socially"] },
      drinker: { type: String, enum: ["Yes", "No", "Socially"] },
      height: {
        start: Number,
        end: Number,
      },
      age: {
        start: Number,
        end: Number,
      },
      children: {
        type: String,
        default: "No",
      },
      distance: {
        type: Number,
        default: 5000000,
      },
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        // default: "point",
        required: true,
      },
      coordinates: {
        type: [Number],
        // index: "2dsphere",
        required: true,
      },
    },
    selfie: {
      type: String,
      default: "",
    },
    fullBody: {
      type: String,
      default: "",
    },
    fullBodyVerify: {
      type: Boolean,
      default: false,
    },
    selfieVerify: {
      type: Boolean,
      default: false,
    },
    iWantToSwipe: {
      type: String,
      default: "",
    },
    yourPlan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    planDuration: {
      type: String,
      enum: ["none", "weekly", "semiyearly", "monthly", "quarterly", "yearly"],
      default: "none",
    },
    planExpire: {
      type: Date,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      default: "",
    },
    emailConfirm: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,      
    },
    phoneConfirm: {
      type: Boolean,
      default: false,
    },
    userVerifyed: {
      type: Boolean,
      default: false,
    },
    userblocked: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      select: false,
    },
    userStatus: {
      type: String,
      default: "InActive",
    },
    videoBio: {
      type: String,
      default: "",
    },
    videoBioVerifyed: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      default: "",
    },
    photos: [
      {
        photoKey: String,
        visibility: {
          type: Boolean,
          default: true,
        },
      },
      { timestamps: true },
    ],
    questions: [
      {
        questionId: {
          type: mongoose.Types.ObjectId,
          ref: "questions",
        },
        question: {
          type: String,
        },
        answer: {
          type: String,
        },
      },
    ],
    oldProfilePhotos: [
      {
        type: String,
      },
    ],

    like: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    dislike: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],

    otherLike: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    otherDislike: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],

    skippedUser: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    timestamps: true,
  }
);

UserSchema.index({ location: "2dsphere" });
// UserSchema.index({ userId: 1, location: "2dsphere" });
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });

// UserSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };
const User = mongoose.model("User", UserSchema);
module.exports = User;
