const express = require("express");
const transactionController = require("./../../controllers/User/transactionController");

const { protect } = require("./../../controllers/User/userAuthController");

const router = express.Router();

router.use(protect);
router.post("/create/payment", transactionController.createPayment);
router.post("/complete/payment", transactionController.completePayment);

module.exports = router;
