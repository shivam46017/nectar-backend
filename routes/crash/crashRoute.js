const crashController = require("../../controllers/crash/crashController");
const express = require("express");

const router = express.Router();

router.post("/create", crashController.createCrash);
router.get("/get", crashController.getAllCrash);
router.delete("/crash/:id", crashController.deleteCrash);

module.exports = router;