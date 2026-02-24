const { Booking, Course, User, Notification, Center, ActivityLog } = require('../models');

// @desc    Book a demo class
// @route   POST /api/bookings/demo
// @access  Private (Student)
const bookDemo = async (req, res) => {
    try {
        const { courseId, staffId, subject, date } = req.body;

        if (!staffId && !courseId) {
            return res.status(400).json({ message: 'Tutor or Course must be specified.' });
        }

        let existingStaffBooking = null;
        if (staffId) {
            existingStaffBooking = await Booking.findOne({
                where: {
                    userId: req.user.id,
                    staffId,
                    type: 'demo'
                }
            });
        }

        const isFree = !existingStaffBooking;

        const booking = await Booking.create({
            userId: req.user.id,
            courseId: courseId || null,
            staffId: staffId || null,
            subject: subject || 'General Demo',
            type: 'demo',
            isFree,
            status: 'confirmed',
            date: date || new Date()
        });

        if (staffId) {
            await Notification.create({
                userId: staffId,
                message: `New Demo Booking: ${req.user.name} has booked a demo for ${subject || 'your subject'}.`,
                type: 'booking'
            });
        }

        // Always notify the student too
        await Notification.create({
            userId: req.user.id,
            message: `Your demo booking for ${subject || 'General'} is confirmed.`,
            type: 'booking'
        });

        // Log the activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'booking_created',
            details: `Booked a ${booking.type} for ${subject || 'General'} with tutor ID: ${staffId || 'TBD'}`,
            userRole: 'student'
        });

        res.status(201).json({
            ...booking.toJSON(),
            message: isFree ? 'Free demo booked successfully!' : 'Demo booked successfully (Standard Rate applies).'
        });
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
                { model: Course, include: [Center] },
                { model: User, as: 'instructor', attributes: ['name', 'profileImage'] }
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
