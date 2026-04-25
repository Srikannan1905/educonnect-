const { Quiz, Question, Assessment, User, Course, Booking } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Staff/Admin)
const createQuiz = async (req, res) => {
    try {
        const { courseId, title, description, timeLimit, passPercentage, questions } = req.body;

        const quiz = await Quiz.create({
            courseId,
            staffId: req.user.id,
            title,
            description,
            timeLimit,
            passPercentage
        });

        // Add questions if provided
        if (questions && questions.length > 0) {
            const questionsWithId = questions.map(q => ({
                ...q,
                quizId: quiz.id
            }));
            await Question.bulkCreate(questionsWithId);
        }

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
const getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // 1. Try fetching quizzes directly linked to this courseId
        let quizzes = await Quiz.findAll({
            where: { courseId, isActive: true },
            include: [{ model: Question, as: 'questions', attributes: { exclude: ['correctAnswer'] } }]
        });

        // 2. If no quizzes found, it might be a Demo/Hourly booking (which doesn't have a formal courseId)
        if (quizzes.length === 0) {
            const booking = await Booking.findByPk(courseId);
            if (booking) {
                // Find quizzes by the same tutor (staffId) OR the same subject
                quizzes = await Quiz.findAll({
                    where: {
                        isActive: true,
                        [Op.or]: [
                            { staffId: booking.staffId },
                            { courseId: { [Op.in]: await getRelatedCourseIds(booking.subject) } }
                        ]
                    },
                    include: [{ model: Question, as: 'questions', attributes: { exclude: ['correctAnswer'] } }]
                });
            }
        }

        res.json(quizzes);
    } catch (error) {
        console.error('Get Quizzes Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper to find courses by subject name
async function getRelatedCourseIds(subject) {
    if (!subject) return [];
    const courses = await Course.findAll({
        where: { subject: { [Op.like]: `%${subject}%` } },
        attributes: ['id']
    });
    return courses.map(c => c.id);
}

// @desc    Get single quiz for students (hides correct answers)
// @route   GET /api/quizzes/view/:id
// @access  Private
const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id, {
            where: { isActive: true },
            include: [
                { model: Question, as: 'questions', attributes: { exclude: ['correctAnswer'] } },
                { model: Course, attributes: ['title'] }
            ]
        });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quiz details with answers (for Staff/Admin)
// @route   GET /api/quizzes/:id
// @access  Private (Staff/Admin)
const getQuizFull = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id, {
            include: [{ model: Question, as: 'questions' }]
        });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assessment
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
const submitAssessment = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, answerIndex }
        const quiz = await Quiz.findByPk(req.params.id, {
            include: [{ model: Question, as: 'questions' }]
        });

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        let totalPoints = 0;

        quiz.questions.forEach(question => {
            totalPoints += question.points;
            const studentAnswer = answers.find(a => a.questionId === question.id);
            if (studentAnswer && studentAnswer.answerIndex === question.correctAnswer) {
                score += question.points;
            }
        });

        const passed = (score / totalPoints) * 100 >= quiz.passPercentage;

        const assessment = await Assessment.create({
            quizId: quiz.id,
            studentId: req.user.id,
            score,
            totalPoints,
            passed
        });

        res.json({
            assessment,
            feedback: passed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz. Please try again or review the material.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all quizzes created by the logged-in staff
// @route   GET /api/quizzes/staff/my
// @access  Private (Staff/Admin)
const getStaffQuizzes = async (req, res) => {
    try {
        const queryOptions = {
            include: [
                { model: Course, attributes: ['title'] },
                { model: User, as: 'instructor', attributes: ['name', 'email'] }
            ]
        };

        // If not admin, limit to user's own quizzes
        if (req.user.role !== 'admin') {
            queryOptions.where = { staffId: req.user.id };
        }

        const quizzes = await Quiz.findAll(queryOptions);
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a quiz and its questions
// @route   PUT /api/quizzes/:id
// @access  Private (Staff/Admin)
const updateQuiz = async (req, res) => {
    try {
        const { title, description, timeLimit, passPercentage, questions } = req.body;
        const quiz = await Quiz.findByPk(req.params.id);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Security: Only creator or admin can update
        if (quiz.staffId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }

        await quiz.update({ title, description, timeLimit, passPercentage });

        // Update questions: Delete old ones and create new ones (simplest approach for bulk edit)
        if (questions) {
            await Question.destroy({ where: { quizId: quiz.id } });
            const questionsWithId = questions.map(q => ({
                ...q,
                quizId: quiz.id
            }));
            await Question.bulkCreate(questionsWithId);
        }

        res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Staff/Admin)
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (quiz.staffId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await quiz.destroy();
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quizzes for courses the student is enrolled in
// @route   GET /api/quizzes/student/my
// @access  Private (Student)
const getStudentQuizzes = async (req, res) => {
    try {
        const { Booking } = require('../models');
        // Find confirmed bookings for student
        const bookings = await Booking.findAll({
            where: { userId: req.user.id, status: 'confirmed' },
            attributes: ['courseId']
        });
        const courseIds = bookings.map(b => b.courseId);

        const quizzes = await Quiz.findAll({
            where: {
                courseId: courseIds,
                isActive: true
            },
            include: [
                { model: Course, attributes: ['title'] },
                { model: User, as: 'instructor', attributes: ['name'] }
            ]
        });

        // Also fetch user's attempts to show status on frontend
        const assessments = await Assessment.findAll({
            where: { studentId: req.user.id }
        });

        // Map status to quizzes
        const quizzesWithStatus = quizzes.map(q => {
            const attempt = assessments.find(a => a.quizId === q.id);
            return {
                ...q.toJSON(),
                completed: !!attempt,
                result: attempt ? { score: attempt.score, totalPoints: attempt.totalPoints, passed: attempt.passed } : null
            };
        });

        res.json(quizzesWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's assessments
// @route   GET /api/quizzes/results/my
// @access  Private (Student)
const getMyResults = async (req, res) => {
    try {
        const results = await Assessment.findAll({
            where: { studentId: req.user.id },
            include: [{ model: Quiz, attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/:id/leaderboard
// @access  Private
const getQuizLeaderboard = async (req, res) => {
    try {
        const results = await Assessment.findAll({
            where: { quizId: req.params.id },
            include: [
                {
                    model: User,
                    as: 'student', // Correct alias from index.js
                    attributes: ['name', 'profileImage', 'registrationId']
                }
            ],
            order: [
                ['score', 'DESC'],
                ['completedAt', 'ASC']
            ],
            limit: 50
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active quizzes on the platform
// @route   GET /api/quizzes/all
// @access  Private
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            where: { isActive: true },
            include: [
                { model: Course, attributes: ['title'] },
                { model: User, as: 'instructor', attributes: ['name'] }
            ]
        });

        // Also fetch user's attempts
        const assessments = await Assessment.findAll({
            where: { studentId: req.user.id }
        });

        const quizzesWithStatus = quizzes.map(q => {
            const attempt = assessments.find(a => a.quizId === q.id);
            return {
                ...q.toJSON(),
                completed: !!attempt,
                result: attempt ? { score: attempt.score, totalPoints: attempt.totalPoints, passed: attempt.passed } : null
            };
        });

        res.json(quizzesWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
