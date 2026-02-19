const { Booking, Course, User, Notification } = require('../models');

// @desc    Book a demo class
// @route   POST /api/bookings/demo
// @access  Private (Student)
const bookDemo = async (req, res) => {
    try {
        const { courseId, date } = req.body;

        // Check if already booked
        const existingBooking = await Booking.findOne({
            where: {
                userId: req.user.id,
                courseId,
                type: 'demo'
            }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked a demo for this course.' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            courseId,
            type: 'demo',
            status: 'confirmed', // Demos are auto-confirmed
            date: new Date() // For now, immediate booking. In real app, allow date selection.
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Course, include: [Center] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Course, attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bookDemo,
    getMyBookings,
    getAllBookings
};
