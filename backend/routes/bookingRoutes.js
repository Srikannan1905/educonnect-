const express = require('express');
const router = express.Router();
const { bookDemo, bookHourly, updateBookingStatus, getMyBookings, getAllBookings, sendMeetingLink } = require('../controllers/bookingController');
const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');

router.post('/demo', protect, bookDemo);
router.post('/hourly', protect, bookHourly);
router.put('/:id/status', protect, adminOrStaff, updateBookingStatus);
router.post('/:id/send-link', protect, adminOrStaff, sendMeetingLink);
router.get('/my', protect, getMyBookings);
router.get('/', protect, adminOrStaff, getAllBookings);

module.exports = router;
