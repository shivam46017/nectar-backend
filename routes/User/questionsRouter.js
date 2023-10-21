const express = require("express");
const questionsController = require("../../controllers/User/questionsController");
const router = express.Router();
const { protect } = require("./../../controllers/User/userAuthController");

router.get("/questions", protect, questionsController.getQuestions);
router.patch("/questions", protect, questionsController.questions);
router.patch("/add/questions", protect, questionsController.addMoreQuestions);
router.patch("/edit/question", protect, questionsController.updateQuestion);

module.exports = router;
