const express = require('express');
const router = express.Router();
const { processPayment, getAllPayments, getMyPayments, deletePayment } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, processPayment);
router.get('/my', protect, getMyPayments);
router.get('/', protect, admin, getAllPayments);
router.delete('/:id', protect, admin, deletePayment); // Added delete route

module.exports = router;
