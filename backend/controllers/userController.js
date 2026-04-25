const { User, Payment, Booking, Notification, ActivityLog } = require('../models');
const bcrypt = require('bcrypt');
const notificationService = require('../utils/notificationService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let whereClause = role ? { role } : {};

        // Security check: Only Admin can see everything. Staff can only see Students.
        if (req.user.role === 'staff') {
            whereClause.role = 'student';
        }
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Pending Staff Requests
exports.getStaffRequests = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'staff', status: 'pending' },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve Staff
exports.approveStaff = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'active';
        await user.save();

        // Notify staff (Internal)
        await Notification.create({
            userId: user.id,
            message: 'Your staff account has been approved! You can now access the staff portal.',
            type: 'system'
        });

        // Notify staff (External Simulation)
        await notificationService.notifyStaffApproval(user);

        res.json({ message: 'Staff approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject Staff
exports.rejectStaff = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = 'rejected';
        await user.save();

        // Notify staff (Internal)
        await Notification.create({
            userId: user.id,
            message: 'Your staff account request has been rejected. Please contact Admin for details.',
            type: 'system'
        });

        // Notify staff (External Simulation)
        await notificationService.notifyStaffRejection(user);

        res.json({ message: 'Staff rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            // Manually delete related records to avoid foreign key constraints
            await Payment.destroy({ where: { userId: user.id } });
            await Booking.destroy({ where: { userId: user.id } });

            await user.destroy();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user (profile image, etc.)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        // Authorization: Admin can update anyone; Users can only update themselves
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const user = await User.findByPk(req.params.id);
        if (user) {
            if (req.body.name !== undefined && req.body.name.trim() !== '') user.name = req.body.name;
            if (req.body.email !== undefined && req.body.email.trim() !== '') {
                // simple check for email uniqueness
                const exist = await User.findOne({ where: { email: req.body.email } });
                if (exist && exist.id !== user.id) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
                user.email = req.body.email;
            }
            if (req.body.phone !== undefined) user.phone = req.body.phone;
            if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;

            // Only Admin can update role and status
            if (req.user.role === 'admin') {
                if (req.body.role) user.role = req.body.role;
                if (req.body.status) user.status = req.body.status;
            }

            if (req.body.qualification !== undefined) user.qualification = req.body.qualification;
            if (req.body.parentName !== undefined) user.parentName = req.body.parentName;
            if (req.body.parentPhone !== undefined) user.parentPhone = req.body.parentPhone;
            if (req.body.specialization !== undefined) user.specialization = req.body.specialization;
            if (req.body.projectPdf !== undefined) user.projectPdf = req.body.projectPdf;
            if (req.body.educationPdf !== undefined) user.educationPdf = req.body.educationPdf;
            if (req.body.bio !== undefined) user.bio = req.body.bio;
            if (req.body.subjects !== undefined) user.subjects = req.body.subjects;

            await user.save();
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                specialization: user.specialization,
                projectPdf: user.projectPdf,
                educationPdf: user.educationPdf,
                qualification: user.qualification,
                bio: user.bio,
                subjects: user.subjects
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get public list of instructors
// @route   GET /api/users/public/instructors
// @access  Public
exports.getPublicInstructors = async (req, res) => {
    try {
        const instructors = await User.findAll({
            where: { role: 'staff', status: 'active' },
            attributes: ['id', 'name', 'qualification', 'profileImage', 'bio', 'subjects']
        });
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get activity logs for a user or all if admin
// @route   GET /api/users/activities
// @access  Private
exports.getActivityLogs = async (req, res) => {
    try {
        let activities;
        if (req.user.role === 'admin') {
            activities = await ActivityLog.findAll({
                include: [{ model: User, as: 'user', attributes: ['name', 'role'] }],
                order: [['createdAt', 'DESC']],
                limit: 50
            });
        } else {
            activities = await ActivityLog.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']],
                limit: 20
            });
        }
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user credentials (email/password) with verification
// @route   PUT /api/users/profile/credentials
// @access  Private
exports.updateCredentials = async (req, res) => {
    try {
        const { currentPassword, newEmail, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Update email if provided
        if (newEmail) {
            // Check if email is already in use
            const existingUser = await User.findOne({ where: { email: newEmail } });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = newEmail;
        }

        // Update password if provided
        if (newPassword) {
            // Password Validation (Match registration standard)
            const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one special character (!@#$%^&*)' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ message: 'Credentials updated successfully', email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
