const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.post('/:id/industry', userController.addIndustry);
router.post('/:id/question', userController.addQuestion);
router.post('/:id/session', userController.addSession);
router.get('/:id/session', userController.getUserSessions);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);
router.delete('/:id/industry', userController.removeIndustry);
router.delete('/:id/question', userController.removeQuestion);
router.put('/:id', userController.updateUser);



module.exports = router;