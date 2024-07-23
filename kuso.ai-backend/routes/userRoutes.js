const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/register', userController.createUser);
router.post('/login', userController.login);

router.use(authMiddleware);
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
router.get('/name', userController.findUserByUsername )



module.exports = router;