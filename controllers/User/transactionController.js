const User = require("../../models/User/userModel");
const PremiumPrice = require("../../models/Plans/premiumPriceModel");
const Transaction = require("./../../models/User/transactionModel");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const cron = require("node-cron");
const { sendNotification } = require("../User/fireBaseAuth");

var twoHoursBefore = new Date();
twoHoursBefore.setHours(twoHoursBefore.getHours() - 1);
function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
cron.schedule("0 * * * *", async () => {
  try {
    const transactionId = [];
    const userTra = await User.find({
      planExpire: { $lte: new Date() },
      yourPlan: "premium",
    });

    for (let i = 0; i < userTra.length; i++) {
      const userElement = userTra[i];
      transactionId.push(userElement.transactionId);
      sendNotification(
        "Oh No 💔 !!!!",
        "Your Plan has been expired",
        userElement.notificationsToken,
        {
          status: "expired",
        }
      );
    }
    const user = await User.updateMany(
      {
        planExpire: { $lte: new Date() },
        yourPlan: "premium",
      },
      {
        planExpire: null,
        planDuration: "none",
        yourPlan: "free",
        transactionId: "",
      }
    );
    const transaction = await Transaction.updateMany(
      {
        transactionId: { $in: transactionId },
      },
      {
        transactionStatus: "expired",
      }
    );

    console.log(user, transaction);
  } catch (error) {
    console.log(error);
  }
});

cron.schedule("10 * * * *", async () => {
  try {
    const transactions = await Transaction.find({
      createdAt: { $gte: twoHoursBefore },
      transactionStatus: { $eq: "pending" },
    });
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      // const paymentConfirm = await stripe.paymentIntents.confirm(
      //   transaction.transactionId,
      //   { payment_method: "pm_card_visa" }
      // );

      const paymentConfirm = await stripe.paymentIntents.retrieve(
        transaction.transactionId
      );
      const user = await User.findById(transaction.user);
      if (paymentConfirm.status === "succeeded") {
        transaction.transactionCompleted = true;
        transaction.transactionStatus = "active";
        await transaction.save();
        user.planDuration = transaction.plainType;
        user.planExpire = new Date(transaction.planExpire);
        user.yourPlan = "premium";
        user.transactionId = transaction.transactionId;
        await user.save();
        sendNotification(
          "Congratulations ",
          "Your payment was successfully, You are on premium plan",
          user.notificationsToken,
          {
            status: "successfully",
          }
        );
      } else {
        await Transaction.findOneAndDelete({
          transactionId: transaction.transactionId,
        });
        sendNotification(
          "Oh No 💔 !!!!",
          "Your payment was unsuccessful, please try again ",
          user.notificationsToken,
          {
            status: "successfully",
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
});

stripe.customers
  .create({
    email: "lilitran127@gmail.com",
  })
  .then((customer) => console.log(customer.email))
  .catch((error) => console.error(error));

exports.createPayment = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, planDuration } = req.body;
    const premiumPrice = await PremiumPrice.findOne();

    const user = await User.findById(userId);
    if (user && premiumPrice[planDuration]) {
      const previousTransaction = await Transaction.findOne({
        user: user._id,
        createdAt: { $gte: twoHoursBefore },
        transactionStatus: { $eq: "pending" },
      });

      if (!previousTransaction) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(premiumPrice[planDuration] * 100),
          currency: "usd",
        });
        console.log(paymentIntent);
        const planExpire = () => {
          if (planDuration === "weekly") {
            return addDays(new Date(), 7);
          } else if (planDuration === "monthly") {
            return addDays(new Date(), 30);
          } else if (planDuration === "quarterly") {
            return addDays(new Date(), 91);
          } else if (planDuration === "semiyearly") {
            return addDays(new Date(), 182);
          } else if (planDuration === "yearly") {
            return addDays(new Date(), 365);
          }
        };
        if (paymentIntent.id) {
          const transaction = await Transaction.create({
            user: user._id,
            transactionId: paymentIntent.id,
            clientSecretKey: paymentIntent.client_secret,
            transactionAmount: premiumPrice[planDuration],
            plainType: planDuration,
            planExpire: planExpire(),
          });
          res.status(201).json({
            status: 201,
            message: "payment created successfully",
            transaction,
          });
        }
      } else {
        res.status(202).json({
          status: 202,
          message: "Previous transaction is pending try after 1 hour",
        });
      }
    } else {
      res.status(404).json({
        status: 404,
        message: "user not found or incorrect data ",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

exports.completePayment = async (req, res) => {
  try {
    const { clientSecretKey } = req.body;
    const transaction = await Transaction.findOne({ clientSecretKey });

    const paymentConfirm = await stripe.paymentIntents.retrieve(
      transaction.transactionId
    );

    console.log(paymentConfirm);
    if (paymentConfirm.status === "succeeded") {
      const user = await User.findById(transaction.user);
      transaction.transactionCompleted = true;
      transaction.transactionStatus = "active";
      await transaction.save();
      user.planDuration = transaction.plainType;
      user.planExpire = new Date(transaction.planExpire);
      user.yourPlan = "premium";
      user.transactionId = transaction.transactionId;
      await user.save();
      sendNotification(
        "Congratulations ",
        "Your payment was successfully, You are on premium plan",
        user.notificationsToken,
        {
          status: "successfully",
        }
      );
      res.status(201).json({
        status: 201,
        message: "user successfully upgraded to premium Plan",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "payment not completed",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

exports.getPremiumPrice = async (req, res) => {
  try {
    const premiumPrice = PremiumPrice.findOne();
    const price = [
      { weekly: premiumPrice.weekly },
      { monthly: premiumPrice.monthly },
      { quarterly: premiumPrice.quarterly },
      { semiyearly: premiumPrice.semiyearly },
      { yearly: premiumPrice.yearly },
    ];
    res.status(200).json({ status: 200, message: "success", price });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

exports.upgradeToPremium = async (req, res) => {
  try {
    const { userId, planDuration } = req.body;
    const user = await User.findById(userId);
    userId.planDuration = planDuration;
    res.status(200).json({ status: 200, message: "success" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
