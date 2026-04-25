const express = require('express');
const router = express.Router();
const { createSession, getSessionsByCourse, getStaffSessions, getStudentSessions, getAllSessions, startSession, endSession, updateSession, deleteSession } = require('../controllers/sessionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllSessions); // Global admin view

router.post('/', protect, createSession);
router.get('/staff', protect, getStaffSessions); // Current staff sessions
router.get('/student', protect, getStudentSessions); // Enrolled student sessions
router.get('/course/:courseId', protect, getSessionsByCourse); // Course sessions
router.put('/:id', protect, updateSession);
router.delete('/:id', protect, deleteSession);
router.put('/:id/start', protect, startSession);
router.put('/:id/end', protect, endSession);

module.exports = router;
