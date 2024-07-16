const express = require('express');
const router = express.Router();
const sessionQuestionController = require('../controllers/sessionQuestionController');

router.post('/', sessionQuestionController.createSessionQuestion);
router.get('/', sessionQuestionController.getAllSessionQuestions);
router.get('/:id', sessionQuestionController.getSessionQuestionById);
router.delete('/:id', sessionQuestionController.deleteSessionQuestion);
router.put('/:id', sessionQuestionController.updateSessionQuestion);
router.post('/:id/feedback', sessionQuestionController.addFeedback);


module.exports = router;
