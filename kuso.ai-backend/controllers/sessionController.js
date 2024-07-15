const sessionModel = require("../models/session");

const createSession = async (req, res) => {
  const { title, category, author } = req.body;
  console.log(req.body);
  try {
    const session = await sessionModel.createSession({ title, category, author });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSessions = async (req, res) => {
  const { user } = req.query;
  try {
    const filters = { user };
    sessions = await sessionModel.getAllSessions(filters);
    console.log(sessions);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  const { title, category, author, x, y } = req.body;
  const { id } = req.params;
  try {
    const session = await sessionModel.updateSession(id, {
      userId,
    });
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
      res.status(404).json({ error: `Session with ID ${sessionId} not found` });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(400).json({ error: error.message });
  }
};

const deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await sessionModel.deleteSession(id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const addSessionQuestion = async (req, res) => {
  const { questionId, isGenerated } = req.body;
  const { id } = req.params;
  try {
    const sessionQuestion = await sessionModel.addSessionQuestion(id, {
      questionId,
      isGenerated,
    });
    res.json(sessionQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addFeedback = async (req, res) => {
    const { SessionId, questionId, isGenerated } = req.body;
    const { id } = req.params;
    try {
      const feedback = await sessionModel.addSessionQuestion({
        score,
        gptResponse,
        userAnswer,
      }, id, {
        questionId
      });
      res.json(feedback);
    } catch (error) {
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