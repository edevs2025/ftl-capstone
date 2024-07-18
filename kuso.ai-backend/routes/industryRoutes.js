const express = require('express');
const router = express.Router();
const industryController = require('../controllers/industryController');

router.post('/', industryController.createIndustry);
router.get('/', industryController.getAllIndustries);
router.get('/:id', industryController.getIndustryById);
router.delete('/:id', industryController.deleteIndustry);
router.put('/:id', industryController.updateIndustry);
router.post('/:id/industry', industryController.addQuestion);


module.exports = router;
