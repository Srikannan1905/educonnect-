const express = require('express');
const router = express.Router();
const { register, login, getUser, registerStaff, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register-staff', registerStaff);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-phone-user', require('../controllers/authController').verifyPhoneUser);
router.post('/verify-security-answer', require('../controllers/authController').verifySecurityAnswer);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/profile', protect, getUser);

module.exports = router;
