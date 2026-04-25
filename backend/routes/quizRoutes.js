const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzesByCourse,
    getQuiz,
    getQuizFull,
    submitAssessment,
    getMyResults,
    getStaffQuizzes,
    getStudentQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizLeaderboard,
    getAllQuizzes
} = require('../controllers/quizController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

router.post('/', protect, adminOrStaff, createQuiz);
router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/staff/my', protect, adminOrStaff, getStaffQuizzes);
router.get('/all', protect, getAllQuizzes);
router.get('/student/my', protect, getStudentQuizzes);
router.get('/view/:id', protect, getQuiz);
router.get('/results/my', protect, getMyResults);
router.get('/:id/leaderboard', protect, getQuizLeaderboard);
router.get('/:id', protect, adminOrStaff, getQuizFull);
router.put('/:id', protect, adminOrStaff, updateQuiz);
router.delete('/:id', protect, adminOrStaff, deleteQuiz);
router.post('/:id/submit', protect, submitAssessment);

module.exports = router;
