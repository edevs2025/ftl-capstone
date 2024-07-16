const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.delete('/:id', questionController.deleteQuestion);
router.put('/:id', questionController.updateQuestion);
router.post('/:id/session', questionController.addSessionQuestion);
router.post('/:id/feedback', questionController.addFeedback);


module.exports = router;
