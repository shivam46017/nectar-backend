const Questions = require("./../../models/User/questionsModel");
const User = require("./../../models/User/userModel");

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Questions.find();
    if (questions && !(questions.length === 0)) {
      res.status(200).json({
        status: "success",
        message: "Successfully",
        questions,
      });
    } else {
      const createQuestions = await Questions.create([
        {
          quesNo: 1,
          questions: `If I had to give up one luxury item/habit for one month, to raise money for charity it would be _______ `,
        },
        {
          quesNo: 2,
          questions: ` If I can solve one societal issue, it would be _______ `,
        },
        {
          quesNo: 3,
          questions: `If I can give advice to 16 year old me, it would be _______ `,
        },
        {
          quesNo: 4,
          questions: ` If I’m having a bad day, _______ helps me relax `,
        },
        {
          quesNo: 5,
          questions: `Everyday I am grateful for _______ `,
        },
        {
          quesNo: 6,
          questions: `My favourite holiday of the year is _______ `,
        },
        {
          quesNo: 7,
          questions: `Valentines day to me, is _______ `,
        },
      ]);
      res.status(200).json({
        status: "success",
        message: "Successfully",
        questions: createQuestions,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.questions = async (req, res) => {
  try {
    const { userId, questionsArray } = req.body;
    console.log(userId, questionsArray);
    if (questionsArray && userId) {
      const user = await User.findById(userId);
      if (user) {
        const answerArray = [];
        for (let i = 0; i < questionsArray.length; i++) {
          const element = questionsArray[i];
          const questionsData = await Questions.findById(element.questionId);
          const que = questionsData.questions.split("_______");
          answerArray.push({
            question: `${que[0]}${element.answer}${que[1]}`,
            answer: element.answer,
            questionId: questionsData._id,
          });
          // console.log(element.questionId);
        }
        user.questions = answerArray;
        await user.save();
        res.status(200).json({
          status: "success",
          message: "Successfully save",
        });
      } else {
        res.status(404).json({
          status: "not found",
          message: "User not found",
        });
      }
    } else {
      res.status(400).json({
        status: "Bad Request",
        message: "incomplete data",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal server Error",
    });
  }
};

exports.addMoreQuestions = async (req, res) => {
  try {
    const { userId, questionsArray } = req.body;
    if (questionsArray && userId) {
      const user = await User.findById(userId);
      if (user) {
        const answerArray = [];
        // for (let i = 0; i < questionsArray.length; i++) {
        //   const element = questionsArray[i];
        for (let j = 0; j < user.questions.length; j++) {
          const userElement = user.questions[j];

          // for (let j = 0; j < user.questions.length; j++) {
          //   const userElement = user.questions[j];
          for (let i = 0; i < questionsArray.length; i++) {
            // console.log(
            //   !questionsArray.some((e) =>
            //     userElement.questionId.equals(e.questionId)
            //   ),
            //   questionsArray,
            //   user.questions
            // );
            const element = questionsArray[i];
            console.log(element.questionId);
            const questionsData = await Questions.findById(element.questionId);
            if (userElement.questionId.equals(questionsData._id)) {
              console.log("if");
              const que = questionsData.questions.split("_______");
              userElement.question = `${que[0]}${element.answer}${que[1]}`;
              userElement.answer = element.answer;
              userElement.questionId = questionsData._id;
            } else if (
              !user.questions.some((e) =>
                e.questionId.equals(element.questionId)
              ) &&
              !answerArray.includes(element.questionId)
            ) {
              console.log("ifelse");

              const que = questionsData.questions.split("_______");
              user.questions.push({
                question: `${que[0]}${element.answer}${que[1]}`,
                answer: element.answer,
                questionId: element.questionId,
              });
              answerArray.push(element.questionId);
            } else {
              console.log("else");
            }
          }
        }
        if (user.questions.length === 0) {
          for (let i = 0; i < questionsArray.length; i++) {
            const element = questionsArray[i];
            const questionsData = await Questions.findById(element.questionId);
            const que = questionsData.questions.split("_______");

            user.questions.push({
              question: `${que[0]}${element.answer}${que[1]}`,
              answer: element.answer,
              questionId: questionsData._id,
            });
            // console.log(element.questionId);
          }
          // user.questions = answerArray;
        } else {
          // user.questions = user.questions.concat(answerArray);
        }
        await user.save();
        res.status(200).json({
          status: "success",
          message: "Successfully save",
        });
      } else {
        res.status(404).json({
          status: "not found",
          message: "User not found",
        });
      }
    } else {
      res.status(400).json({
        status: "Bad Request",
        message: "incomplete data",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal server Error",
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { userId, questionId, answer } = req.body;
    const user = await User.findById(userId);
    const questionData = await Questions.findById(questionId);

    for (let i = 0; i < user.questions.length; i++) {
      const element = user.questions[i];
      if (element.questionId.equals(questionData._id)) {
        const que = questionData.questions.split("_______");
        element.question = `${que[0]}${answer}${que[1]}`;
        element.answer = answer;
        element.questionId = questionData._id;
      }
    }
    await user.save();
    // const questionsData = await Questions.findById(questionId);
    // const que = questionsData.questions.split("_______");
    // answerArray.push(`${que[0]} ${element.answer} ${que[1]}`);
    res.status(200).json({
      status: "success",
      message: "Question updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal server Error",
    });
  }
};
