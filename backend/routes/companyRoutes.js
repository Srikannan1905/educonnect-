const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

const { protect, adminOrStaff } = require('../middleware/authMiddleware');

// In a real app, update would be protected by admin middleware
router.get('/', companyController.getCompanySettings);
router.put('/', protect, adminOrStaff, companyController.updateCompanySettings);

module.exports = router;
