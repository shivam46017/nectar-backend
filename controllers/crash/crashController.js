const  crashSchema  = require("../../models/crashSchema");

exports.createCrash = async (req, res) => {
  try {
    const { message, deviceInfo } = req.body;
    console.log(message, deviceInfo);
    const crash = await crashSchema.create({ message, deviceInfo });
    return res.status(201).json({ crash });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllCrash = async (req, res) => {
  try {
    const crash = await crashSchema.find();
    return res.status(200).json({ crash });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteCrash = async (req, res) => {
  try {
    const { id } = req.params;
    const crash = await crashSchema.findByIdAndDelete(id);
    return res.status(200).json({ crash });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
