const { Session, ActivityLog, Notification, User, Course } = require('../models');

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (Staff/Admin)
const createSession = async (req, res) => {
    try {
        const { courseId, title, date, startTime, meetingLink, platform, description } = req.body;
        const session = await Session.create({
            courseId,
            staffId: req.user.id,
            title,
            date,
            startTime,
            meetingLink,
            platform,
            description,
            status: 'scheduled'
        });

        // Log session creation
        await ActivityLog.create({
            userId: req.user.id,
            action: 'session_created',
            details: `Created session: ${title} for course: ${courseId}`,
            userRole: req.user.role
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all sessions for a course
// @route   GET /api/sessions/course/:courseId
// @access  Private
const getSessionsByCourse = async (req, res) => {
    try {
        const sessions = await Session.findAll({
            where: { courseId: req.params.courseId },
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current staff sessions
// @route   GET /api/sessions/staff
// @access  Private (Staff)
const getStaffSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll({
            where: { staffId: req.user.id },
            include: [{ model: Course, attributes: ['title'] }],
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start a session
// @route   PUT /api/sessions/:id/start
const startSession = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.status = 'in_progress';
        await session.save();

        await ActivityLog.create({
            userId: req.user.id,
            action: 'session_started',
            details: `Started session: ${session.title}`,
            userRole: req.user.role
        });

        res.json({ message: 'Session started', session });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    End a session
// @route   PUT /api/sessions/:id/end
const endSession = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.status = 'completed';
        await session.save();

        await ActivityLog.create({
            userId: req.user.id,
            action: 'session_ended',
            details: `Ended session: ${session.title}`,
            userRole: req.user.role
        });

        res.json({ message: 'Session completed', session });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createSession,
    getSessionsByCourse,
    getStaffSessions,
    startSession,
    endSession
};
