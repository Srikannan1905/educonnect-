const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// In a real app, update would be protected by admin middleware
router.get('/', companyController.getCompanySettings);
router.put('/', companyController.updateCompanySettings);

module.exports = router;
