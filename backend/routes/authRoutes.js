const express = require('express');
const router = express.Router();
const { register, login, getUser, registerStaff, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register-staff', registerStaff);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', protect, getUser);

module.exports = router;
