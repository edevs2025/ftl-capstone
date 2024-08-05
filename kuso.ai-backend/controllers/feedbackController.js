const feedbackModel = require('../models/feedback')

const createFeedback = async (req, res) => {
    // const { score, gptResponse, userAnswer, sessionQuestion } = req.body;
    try {
        const feedback = await feedbackModel.createFeedback(req.body);
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateFeedback = async(req, res) => {
    try {
        const updatedFeedback = await feedbackModel.updateFeedback(req.params.id, req.body);
        if(updatedFeedback) {
            res.status(200).json(updatedFeedback);
        }else {
            req.status(400).json({ error: error.message })
        }
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

const getAllFeedbacks = async (req, res) => {
    try {
      feedbacks = await feedbackModel.getAllFeedbacks();
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

const getFeedbackById = async (req, res) => {
    const {id} = req.params;
    try{
        const feedback = await feedbackModel.getFeedbackByID(id);
        if (!feedback) {
            return res
              .status(404)
              .json({ error: `Feedback with ID ${id} not found` });
          }
          res.json(feedback);
    } catch (error){
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteFeedback = async (req, res) => {
    const { id } = req.params;
    try {
        const feedback = await  feedbackModel.deleteFeedback(id);
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
    createFeedback,
    getAllFeedbacks,
    updateFeedback,
    getFeedbackById,
    deleteFeedback,
}
