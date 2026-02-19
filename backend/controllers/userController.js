const { User, Payment, Booking } = require('../models');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let whereClause = role ? { role } : {};

        // Security check: Only Admin can see everything. Staff can only see Students.
        if (req.user.role === 'staff' && role !== 'student') {
            return res.status(403).json({ message: 'Staff can only view students' });
        }
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] }
        });
        console.log(`[DEBUG] getUsers: role=${role}, found ${users.length} users`);
        res.json(users);
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
            if (req.body.name) user.name = req.body.name;
            if (req.body.email) user.email = req.body.email;
            if (req.body.phone) user.phone = req.body.phone;
            if (req.body.profileImage) user.profileImage = req.body.profileImage;

            // Only Admin can update role and status
            if (req.user.role === 'admin') {
                if (req.body.role) user.role = req.body.role;
                if (req.body.status) user.status = req.body.status;
            }

            if (req.body.qualification) user.qualification = req.body.qualification;
            if (req.body.parentName) user.parentName = req.body.parentName;
            if (req.body.parentPhone) user.parentPhone = req.body.parentPhone;

            await user.save();
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
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
            attributes: ['id', 'name', 'qualification', 'profileImage']
        });
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
