const express = require("express");
const communityQuestionController = require("./../../controllers/User/communityQuestionController");
const { protect } = require("./../../controllers/User/userAuthController");

const router = express.Router();

router.post(
  "/community/create/question",
  protect,
  communityQuestionController.createQuestion
);
router.post(
  "/community/question/comment",
  protect,
  communityQuestionController.commentOnQuestion
);

router.post(
  "/community/question/comment/like",
  protect,
  communityQuestionController.likeOnCommentOfQuestion
);

router.get(
  "/community/get/user/questions/:userId",
  protect,
  communityQuestionController.getUserQuestion
);

router.get(
  "/community/get/question/:limit/:page",
  protect,
  communityQuestionController.getQuestionByLimit
);

router.get(
  "/community/question/search/:query",
  protect,
  communityQuestionController.searchCommunityQuestion
);

router.get(
  "/community/get/question/comment/:limit/:page/:questionId",
  protect,
  communityQuestionController.getQuestionCommentByLimit
);

module.exports = router;
