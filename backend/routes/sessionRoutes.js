const express = require('express');
const router = express.Router();
const { createSession, getSessionsByCourse, getStaffSessions, startSession, endSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/staff', protect, getStaffSessions); // Current staff sessions
router.get('/course/:courseId', protect, getSessionsByCourse); // Course sessions
router.put('/:id/start', protect, startSession);
router.put('/:id/end', protect, endSession);

module.exports = router;
