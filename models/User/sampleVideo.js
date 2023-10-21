const mongoose = require("mongoose");
const sampleVideoSchema = new mongoose.Schema({
    videoPath: {
        type: String,
    },
});

const sampleVideo = mongoose.model("SampleVideo", sampleVideoSchema);

module.exports = sampleVideo;
