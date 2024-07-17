const industryModel = require("../models/industryModel");

// Create a new Industry
const createIndustry = async (req, res) => {
  const { industryName, users, questions } = req.body;
  
  if (!industryName) {
    return res.status(400).json({ error: "industryName is required" });
  }

  try {
    const industry = await industryModel.createIndustry({ industryName, users, questions });
    res.status(201).json(industry);
  } catch (error) {
    console.error("Error creating industry:", error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: "Industry with this name already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Get all Industries
const getAllIndustries = async (req, res) => {
  const { industryName } = req.query;
  try {
    const filters = { industryName };
    const industries = await industryModel.getAllIndustries(filters);
    res.json(industries);
  } catch (error) {
    console.error("Error fetching industries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an Industry
const updateIndustry = async (req, res) => {
  const { id } = req.params;
  const { industryName, users, questions } = req.body;

  if (!industryName) {
    return res.status(400).json({ error: "industryName is required" });
  }

  try {
    const updatedIndustry = await industryModel.updateIndustry(id, { industryName, users, questions });
    if (updatedIndustry) {
      res.json(updatedIndustry);
    } else {
      res.status(404).json({ error: "Industry not found" });
    }
  } catch (error) {
    console.error("Error updating industry:", error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: "Industry with this name already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Get a specific Industry
const getIndustryById = async (req, res) => {
  const { id } = req.params;

  try {
    const industry = await industryModel.getIndustryById(id);
    if (industry) {
      res.json(industry);
    } else {
      res.status(404).json({ error: "Industry not found" });
    }
  } catch (error) {
    console.error("Error fetching industry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an Industry
const deleteIndustry = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedIndustry = await industryModel.deleteIndustry(id);
    if (deletedIndustry) {
      res.json({ message: "Industry successfully deleted" });
    } else {
      res.status(404).json({ error: "Industry not found" });
    }
  } catch (error) {
    console.error("Error deleting industry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a User to an Industry
const addUser = async (req, res) => {
  const { id: industryId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const updatedIndustry = await industryModel.addUser(industryId, userId);
    res.json(updatedIndustry);
  } catch (error) {
    console.error("Error adding user to industry:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Industry or User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Add a Question to an Industry
const addQuestion = async (req, res) => {
  const { id: industryId } = req.params;
  const { questionId, questionContent } = req.body;

  if (!questionId && !questionContent) {
    return res.status(400).json({ error: "Either questionId or questionContent is required" });
  }

  try {
    const updatedIndustry = await industryModel.addQuestion(industryId, { questionId, questionContent });
    res.json(updatedIndustry);
  } catch (error) {
    console.error("Error adding question to industry:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Industry not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = {
  createIndustry,
  getAllIndustries,
  updateIndustry,
  getIndustryById,
  deleteIndustry,
  addUser,
  addQuestion,
};