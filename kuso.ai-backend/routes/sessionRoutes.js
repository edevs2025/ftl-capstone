const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.delete('/:id', sessionController.deleteSession);
router.put('/:id', sessionController.updateSession);
router.post('/:id/question', sessionController.addSessionQuestion);
router.post('/:id/feedback', sessionController.addFeedback);


module.exports = router;
