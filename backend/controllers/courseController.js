const { Course, Center } = require('../models');
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
        if (subject) whereClause.subject = { [Op.iLike]: `%${subject}%` };
        if (mode) whereClause.mode = mode;

        let includeClause = [];
        if (city) {
            includeClause.push({
                model: Center,
                where: { city: { [Op.iLike]: `%${city}%` } },
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

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};
