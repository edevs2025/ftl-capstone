const questionModel = require("../models/question");

// Create a new Question
const createQuestion = async (req, res) => {
  const { questionContent, users, industries } = req.body;
  
  if (!questionContent) {
    return res.status(400).json({ error: "questionContent is required" });
  }

  try {
    const question = await questionModel.createQuestion({ questionContent, users, industries });
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all Questions
const getAllQuestions = async (req, res) => {
  const { questionContent } = req.query;
  try {
    const filters = { questionContent };
    const questions = await questionModel.getAllQuestions(filters);
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a Question
const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { questionContent, users, industries } = req.body;

  if (!questionContent) {
    return res.status(400).json({ error: "questionContent is required" });
  }

  try {
    const updatedQuestion = await questionModel.updateQuestion(id, { questionContent, users, industries });
    if (updatedQuestion) {
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific Question
const getQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await questionModel.getQuestionById(id);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a Question
const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await questionModel.deleteQuestion(id);
    if (deletedQuestion) {
      res.json({ message: "Question successfully deleted" });
    } else {
      res.status(404).json({ error: "Question not found" });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a User to a Question
const addUser = async (req, res) => {
  const { id: questionId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const updatedQuestion = await questionModel.addUser(questionId, userId);
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error adding user to question:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Question or User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Add an Industry to a Question
const addIndustry = async (req, res) => {
  const { id: questionId } = req.params;
  const { industryName } = req.body;

  if (!industryName) {
    return res.status(400).json({ error: "industryName is required" });
  }

  try {
    const updatedQuestion = await questionModel.addIndustry(questionId, { industryName });
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error adding industry to question:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Question not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Add a SessionQuestion to a Question
const addSessionQuestion = async (req, res) => {
  const { id: questionId } = req.params;
  const { sessionId, isGenerated } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const sessionQuestion = await questionModel.addSessionQuestion(questionId, { sessionId, isGenerated });
    res.status(201).json(sessionQuestion);
  } catch (error) {
    console.error("Error adding session question:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Question or Session not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Add Feedback to a Question
const addFeedback = async (req, res) => {
  const { id: questionId } = req.params;
  const { sessionId, score, gptResponse, userAnswer } = req.body;

  if (!sessionId || score === undefined || !gptResponse || !userAnswer) {
    return res.status(400).json({ error: "sessionId, score, gptResponse, and userAnswer are required" });
  }

  try {
    const feedback = await questionModel.addFeedback(sessionId, questionId, { score, gptResponse, userAnswer });
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error adding feedback:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Question or Session not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  getQuestionById,
  deleteQuestion,
  addUser,
  addIndustry,
  addSessionQuestion,
  addFeedback
};