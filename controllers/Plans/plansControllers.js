const Plans = require("./../../models/Plans/plansModel");
const PremiumPrice = require("./../../models/Plans/premiumPriceModel");

exports.createPlans = async (req, res) => {
  try {
    const { planName } = req.body;
    const plansCounts = await Plans.find().count();
    const createPlan = await Plans.create({
      planName,
      plan: plansCounts,
    });
    res.status(200).json({
      status: "success",
      message: "Successfully create Plan",
      plan: createPlan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "internal server error",
    });
  }
};

exports.ChangedPlanFree = async (req, res) => {
  try {
    const { id, free } = req.body;
    const plan = await Plans.findByIdAndUpdate(id, { free });
    res.status(200).json({
      status: "success",
      message: " Successfully updated Plan",
      plan,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "internal server error" });
  }
};
exports.ChangedPlanPremium = async (req, res) => {
  try {
    const { id, premium } = req.body;
    const plan = await Plans.findByIdAndUpdate(id, { premium });
    res.status(200).json({
      status: "success",
      message: " Successfully updated Plan",
      plan,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "internal server error" });
  }
};
exports.getAllPlans = async (req, res) => {
  const plans = await Plans.find().sort({ plan: +1 });
  if (plans.length > 1) {
    res.status(200).json({ status: "success", message: "success", plans });
  } else {
    const createPlans = await Plans.create([
      { planName: "Swipe bio", plan: 0 },
      { planName: "Match with bio", plan: 1 },
      { planName: "See my admirers", plan: 2 },
      { planName: "Message matches", plan: 3 },
      { planName: "Go back", plan: 4 },
      { planName: "Find my mate a date", plan: 5 },
    ]);
    res
      .status(200)
      .json({ status: "success", message: "success", plans: "createPlans" });
  }
  try {
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server Error",
    });
  }
};

exports.getPremiumPrice = async (req, res) => {
  try {
    const premiumPrice = await PremiumPrice.findOne({ premium: "premium" });
    if (premiumPrice) {
      res.status(200).json({
        status: "success",
        message: "Price Updated Successfully",
        premiumPrice,
      });
    } else {
      const premiumPrice = await PremiumPrice.create({ premium: "premium" });
      res.status(200).json({
        status: "success",
        message: "Price Updated Successfully",
        premiumPrice,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server Error",
    });
  }
};

exports.updatePremiumPrice = async (req, res) => {
  try {
    const premiumPrice = await PremiumPrice.findOne({ premium: "premium" });
    const { weekly, monthly, quarterly, semiyearly, yearly } = req.body;

    premiumPrice.weekly = weekly;
    premiumPrice.monthly = monthly;
    premiumPrice.quarterly = quarterly;
    premiumPrice.semiyearly = semiyearly;
    premiumPrice.yearly = yearly;

    await premiumPrice.save();
    res.status(200).json({
      status: "success",
      message: "Price Updated Successfully",
      premiumPrice,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server Error",
    });
  }
};
