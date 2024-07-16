const questionModel = require("../models/question");

const createQuestion = async (req, res) => {
  const { questionContent, users, industries } = req.body;
  try {
    const question = await questionModel.createQuestion({ questionContent, users, industries });
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  const { questionContent } = req.query;
  try {
    const filters = { questionContent };
    const questions = await questionModel.getAllQuestions(filters);
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  const { questionContent, users, industries } = req.body;
  const { id } = req.params;
  try {
    const question = await questionModel.updateQuestion(id, {
      questionContent,
      users,
      industries
    });
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ error: `Question with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: error.message });
  }
};

const getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await questionModel.getQuestionById(id);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ error: `Question with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await questionModel.deleteQuestion(id);
    if (question) {
      res.json({ message: `Question with ID ${id} successfully deleted` });
    } else {
      res.status(404).json({ error: `Question with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSessionQuestion = async (req, res) => {
  const { sessionId, isGenerated } = req.body;
  const { id: questionId } = req.params;
  try {
    const sessionQuestion = await questionModel.addSessionQuestion(questionId, {
      sessionId,
      isGenerated,
    });
    res.status(201).json(sessionQuestion);
  } catch (error) {
    console.error("Error adding session question:", error);
    res.status(500).json({ error: error.message });
  }
};

const addFeedback = async (req, res) => {
  const { score, gptResponse, userAnswer, sessionId } = req.body;
  const { id: questionId } = req.params;
  try {
    const feedback = await questionModel.addFeedback(sessionId, questionId, {
      score,
      gptResponse,
      userAnswer,
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
  addSessionQuestion,
  addFeedback,
};