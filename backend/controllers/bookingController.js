const { Booking, Course, User, Notification, Center, ActivityLog, Session } = require('../models');

// @desc    Book a demo class
// @route   POST /api/bookings/demo
// @access  Private (Student)
const bookDemo = async (req, res) => {
    try {
        const { courseId, staffId, subject, date, startTime } = req.body;

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

        const platform = 'zoom';
        const meetingLink = `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`;

        const booking = await Booking.create({
            userId: req.user.id,
            courseId: courseId || null,
            staffId: staffId || null,
            subject: subject || 'General Demo',
            type: 'demo',
            isFree,
            status: 'confirmed',
            date: date || new Date(),
            startTime: startTime || '09:00',
            meetingLink,
            platform
        });

        // Create a corresponding session for the schedule
        await Session.create({
            title: `Demo: ${subject || 'General Session'}`,
            date: booking.date,
            startTime: booking.startTime,
            studentId: booking.userId,
            meetingLink,
            platform,
            courseId: booking.courseId,
            staffId: booking.staffId,
            status: 'scheduled'
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

        // Notify Admins
        const admins = await User.findAll({ where: { role: 'admin' } });
        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                userId: admin.id,
                message: `SYSTEM ALERT: New Demo Booking created by ${req.user.name} for ${subject || 'General'}.`,
                type: 'system'
            }));
            await Notification.bulkCreate(adminNotifications);
        }

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
                {
                    model: Course,
                    include: [
                        { model: Center },
                        { model: User, as: 'instructor', attributes: ['name', 'profileImage', 'email', 'phone'] }
                    ]
                },
                { model: User, as: 'instructor', attributes: ['name', 'profileImage', 'email', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin & Staff)
// @route   GET /api/bookings
// @access  Private/AdminOrStaff
const getAllBookings = async (req, res) => {
    try {
        let whereClause = {};
        if (req.user && req.user.role === 'staff') {
            whereClause = { staffId: req.user.id };
        }

        const bookings = await Booking.findAll({
            where: whereClause,
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

// @desc    Book an hourly session with a tutor
// @route   POST /api/bookings/hourly
// @access  Private (Student)
const bookHourly = async (req, res) => {
    try {
        const { staffId, subject, date, startTime } = req.body;

        if (!staffId) {
            return res.status(400).json({ message: 'Tutor must be specified.' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            staffId,
            subject: subject || 'Hourly Booking',
            type: 'hourly',
            isFree: false, // Hourly bookings are fully paid/agreed upon
            status: 'pending', // Pending admin/staff approval
            date: date || new Date(),
            startTime: startTime || '09:00'
        });

        // Notify staff
        await Notification.create({
            userId: staffId,
            message: `New Hourly Booking Request: ${req.user.name} has requested an hourly session for ${subject}.`,
            type: 'booking'
        });

        // Notify Admins
        const admins = await User.findAll({ where: { role: 'admin' } });
        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                userId: admin.id,
                message: `SYSTEM ALERT: New Hourly Booking Request by ${req.user.name} for ${subject}.`,
                type: 'system'
            }));
            await Notification.bulkCreate(adminNotifications);
        }

        // Log the activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'booking_created',
            details: `Requested an hourly session for ${subject} with tutor ID: ${staffId}`,
            userRole: 'student'
        });

        res.status(201).json({
            ...booking.toJSON(),
            message: 'Hourly session requested successfully!'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'confirmed', 'cancelled', etc.
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow staff assigned to it or an admin to update
        if (req.user.role === 'staff' && booking.staffId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        // If status is confirmed, automate session and Zoom link
        if (status === 'confirmed' && booking.status !== 'confirmed') {

            const meetingLink = `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`;
            const platform = 'zoom';

            try {
                // Create a session for the schedule
                const session = await Session.create({
                    title: `${booking.type === 'demo' ? 'Demo' : 'Class'}: ${booking.subject || 'Session'}`,
                    date: booking.date,
                    startTime: booking.startTime || '09:00',
                    studentId: booking.userId,
                    meetingLink,
                    platform,
                    courseId: booking.courseId,
                    staffId: booking.staffId,
                    status: 'scheduled'
                });

                booking.meetingLink = meetingLink;
                booking.platform = platform;
            } catch (sessionError) {
                console.error(`[ERROR] Critical error during automated session creation for booking ${booking.id}:`, sessionError);
            }
        }

        booking.status = status;
        await booking.save();

        // Notify Student
        await Notification.create({
            userId: booking.userId,
            message: `Your booking for ${booking.subject || 'Class'} has been ${status}.`,
            type: 'booking'
        });

        res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Send meeting link directly to student
// @route   POST /api/bookings/:id/send-link
// @access  Private (Staff/Admin)
const sendMeetingLink = async (req, res) => {
    try {
        const { platform, meetingLink, additionalMessage } = req.body;
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['name', 'email'] }]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow assigned staff or admin
        if (req.user.role === 'staff' && booking.staffId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to send links for this booking' });
        }

        // Save link directly to the booking record for UI convenience
        await booking.update({ meetingLink, platform });

        const message = `Meeting Link (${platform.toUpperCase()}): ${meetingLink} ${additionalMessage ? '\nMessage: ' + additionalMessage : ''}`;

        await Notification.create({
            userId: booking.userId,
            message: `Your tutor has sent a meeting link for your booking (${booking.subject || 'General'}):\n${message}`,
            type: 'booking'
        });

        await ActivityLog.create({
            userId: req.user.id,
            action: 'custom_message',
            details: `Sent meeting link to student ${booking.User.name} for booking ID: ${booking.id}`,
            userRole: req.user.role
        });

        res.json({ message: 'Meeting link sent successfully to the student.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    bookDemo,
    bookHourly,
    updateBookingStatus,
    getMyBookings,
    getAllBookings,
    sendMeetingLink
};
