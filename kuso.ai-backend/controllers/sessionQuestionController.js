const sessionQuestionModel = require("../models/sessionQuestion");

// Create a new SessionQuestion
const createSessionQuestion = async (req, res) => {
  const { sessionId, questionId, askedAt, isGenerated } = req.body;
  
  if (!sessionId || !questionId) {
    return res.status(400).json({ error: "sessionId and questionId are required" });
  }

  try {
    const sessionQuestion = await sessionQuestionModel.createSessionQuestion({
      sessionId: parseInt(sessionId),
      questionId: parseInt(questionId),
      askedAt: askedAt ? new Date(askedAt) : new Date(),
      isGenerated: isGenerated || false
    });
    res.status(201).json(sessionQuestion);
  } catch (error) {
    console.error("Error creating sessionQuestion:", error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: "SessionQuestion already exists" });
    } else if (error.code === 'P2003') {
      res.status(400).json({ error: "Invalid sessionId or questionId" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Get all SessionQuestions
const getAllSessionQuestions = async (req, res) => {
  const { sessionId, questionId } = req.query;
  try {
    const filters = {};
    if (sessionId) filters.sessionId = sessionId;
    if (questionId) filters.questionId = questionId;
    
    const sessionQuestions = await sessionQuestionModel.getAllSessionQuestions(filters);
    res.json(sessionQuestions);
  } catch (error) {
    console.error("Error fetching sessionQuestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a SessionQuestion
const updateSessionQuestion = async (req, res) => {
  const { sessionId, questionId } = req.params;
  const { askedAt, isGenerated } = req.body;

  if (!sessionId || !questionId) {
    return res.status(400).json({ error: "sessionId and questionId are required" });
  }

  try {
    const updatedSessionQuestion = await sessionQuestionModel.updateSessionQuestion(
      sessionId,
      questionId,
      { askedAt: askedAt ? new Date(askedAt) : undefined, isGenerated }
    );
    if (updatedSessionQuestion) {
      res.json(updatedSessionQuestion);
    } else {
      res.status(404).json({ error: "SessionQuestion not found" });
    }
  } catch (error) {
    console.error("Error updating sessionQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific SessionQuestion
const getSessionQuestionById = async (req, res) => {
  const { id: sessionQuestionId } = req.params;

  if (!sessionQuestionId) {
    return res.status(400).json({ error: "sessionQuestionId is required" });
  }

  try {
    const sessionQuestion = await sessionQuestionModel.getSessionQuestionById(sessionQuestionId);
    if (sessionQuestion) {
      res.json(sessionQuestion);
    } else {
      res.status(404).json({ error: "SessionQuestion not found" });
    }
  } catch (error) {
    console.error("Error fetching sessionQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a SessionQuestion
const deleteSessionQuestion = async (req, res) => {
  const { id: sessionQuestionId  } = req.params;

  if (!sessionQuestionId) {
    return res.status(400).json({ error: "sessionQuestionId is required" });
  }

  try {
    const deletedSessionQuestion = await sessionQuestionModel.deleteSessionQuestion(sessionQuestionId);
    if (deletedSessionQuestion) {
      res.json({ message: "SessionQuestion successfully deleted" });
    } else {
      res.status(404).json({ error: "SessionQuestion not found" });
    }
  } catch (error) {
    console.error("Error deleting sessionQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add feedback to a SessionQuestion
const addFeedback = async (req, res) => {
  const { sessionId, questionId } = req.params;
  const { score, gptResponse, userAnswer } = req.body;

  if (!sessionId || !questionId || !score || !gptResponse || !userAnswer) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const feedback = await sessionQuestionModel.addFeedback(sessionId, questionId, {
      score: parseFloat(score),
      gptResponse,
      userAnswer
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error adding feedback:", error);
    if (error.code === 'P2003') {
      res.status(400).json({ error: "Invalid sessionId or questionId" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = {
  createSessionQuestion,
  getAllSessionQuestions,
  updateSessionQuestion,
  getSessionQuestionById,
  deleteSessionQuestion,
  addFeedback
};