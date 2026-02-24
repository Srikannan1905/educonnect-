const { Course, Center, CourseRequest, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all courses with filters
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const { board, subject, city, mode } = req.query;
        let whereClause = {};

        if (board) whereClause.board = board;
        if (subject) whereClause.subject = { [Op.like]: `%${subject}%` };
        if (mode) whereClause.mode = mode;

        let includeClause = [];
        if (city) {
            includeClause.push({
                model: Center,
                where: { city: { [Op.like]: `%${city}%` } },
            });
        } else {
            includeClause.push({ model: Center });
        }

        const courses = await Course.findAll({
            where: whereClause,
            include: includeClause,
        });
        res.json(courses);
    } catch (error) {
        console.error('Get Courses Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [Center],
        });
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (course) {
            await course.update(req.body);
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (course) {
            await course.destroy();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a new course (Staff)
// @route   POST /api/courses/request
// @access  Private/Staff
const requestCourse = async (req, res) => {
    try {
        const { title, subject, board, mode, description } = req.body;
        const request = await CourseRequest.create({
            title,
            subject,
            board,
            mode,
            description,
            staffId: req.user.id
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all course requests (Admin) or my requests (Staff)
// @route   GET /api/courses/requests
// @access  Private
const getCourseRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'admin') {
            requests = await CourseRequest.findAll({
                include: [{ model: User, as: 'staff', attributes: ['name', 'email'] }]
            });
        } else {
            requests = await CourseRequest.findAll({
                where: { staffId: req.user.id }
            });
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject course request (Admin)
// @route   PUT /api/courses/requests/:id
// @access  Private/Admin
const approveCourseRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const request = await CourseRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        if (status === 'approved') {
            // Create actual course
            await Course.create({
                title: request.title,
                subject: request.subject,
                board: request.board,
                mode: request.mode,
                description: request.description,
                staffId: request.staffId,
                price: 0 // Default to 0 since we're removing pricing logic
            });
        }

        res.json({ message: `Course request ${status}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    requestCourse,
    getCourseRequests,
    approveCourseRequest
};
