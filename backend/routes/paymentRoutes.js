const express = require('express');
const router = express.Router();
const { processPayment, getAllPayments, getMyPayments, deletePayment, verifyPayment } = require('../controllers/paymentController');
const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('screenshot'), processPayment);
router.post('/:id/verify', protect, adminOrStaff, verifyPayment);
router.get('/my', protect, getMyPayments);
router.get('/', protect, adminOrStaff, getAllPayments);
router.delete('/:id', protect, admin, deletePayment); // Added delete route

module.exports = router;
