const userModel = require("../models/user");

const createUser = async (req, res) => {
  const { username, name, email, password, age, employed, industries, questions, sessions } = req.body;
  try {
    const user = await userModel.createUser({ username, name, email, password, age, employed, industries, questions, sessions });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const { userId } = req.query;
  try {
    const filters = { userId };
    const users = await userModel.getAllUsers(filters);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { username, name, email, password, age, employed, industries, questions, sessions } = req.body;
  const { id } = req.params;
  try {
    const user = await userModel.updateUser(id, {
      username, name, email, password, age, employed, industries, questions, sessions
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.deleteUser(id);
    if (user) {
      res.json({ message: `User with ID ${id} successfully deleted` });
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addIndustry = async (req, res) => {
  const { industryId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.addIndustry(userId,  industryId );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error adding industry to user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addQuestion = async (req, res) => {
  const { questionId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.addQuestion(userId,  questionId );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error adding question to user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSession = async (req, res) => {
  const { questions, feedback } = req.body;
  const { id: userId } = req.params;
  try {
    const newSession = await userModel.addSession(userId, { questions, feedback });
    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error adding session for user:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeIndustry = async (req, res) => {
  const { industryId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.removeIndustry(userId, industryId);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error removing industry from user:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeQuestion = async (req, res) => {
  const { questionId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.removeQuestion(userId, questionId);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error removing question from user:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  addIndustry,
  addQuestion,
  addSession,
  removeIndustry,
  removeQuestion,
};