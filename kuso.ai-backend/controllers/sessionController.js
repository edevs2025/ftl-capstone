const sessionModel = require("../models/session");

const createSession = async (req, res) => {
  const { userId } = req.body;
  try {
    const session = await sessionModel.createSession({ userId });
    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllSessions = async (req, res) => {
  const { userId } = req.query;
  try {
    const filters = { userId };
    const sessions = await sessionModel.getAllSessions(filters);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  try {
    const session = await sessionModel.updateSession(id, { userId });
    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ error: `Session with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await sessionModel.getSessionById(id);
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ error: `Session with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await sessionModel.deleteSession(id);
    if (session) {
      res.json({ message: `Session with ID ${id} successfully deleted` });
    } else {
      res.status(404).json({ error: `Session with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSessionQuestion = async (req, res) => {
  const { questionId, isGenerated } = req.body;
  const { id: sessionId } = req.params;
  try {
    const sessionQuestion = await sessionModel.addSessionQuestion(sessionId, {
      questionId,
      isGenerated,
    });
    res.status(201).json(sessionQuestion);
  } catch (error) {
    console.error("Error adding session question:", error);
    res.status(500).json({ error: error.message });
  }
};

const addFeedback = async (req, res) => {
  const { score, gptResponse, userAnswer, sessionId, questionId } = req.body;
  try {
    const feedback = await sessionModel.addFeedback(sessionId, questionId, {
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
  createSession,
  getAllSessions,
  getSessionById,
  deleteSession,
  updateSession,
  addSessionQuestion,
  addFeedback,
};