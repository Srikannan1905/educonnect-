const express = require('express');
const router = express.Router();
const { bookDemo, getMyBookings, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/demo', protect, bookDemo);
router.get('/my', protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);

module.exports = router;
