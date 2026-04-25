const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private (Admin or Staff)
router.get('/', protect, adminOrStaff, async (req, res) => {
    try {
        let whereClause = {};
        if (req.user && req.user.role === 'staff') {
            whereClause = { userId: req.user.id };
        }
        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Admin or Staff)
router.put('/:id/read', protect, adminOrStaff, async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (notification) {
            // Verify ownership if the user is staff
            if (req.user.role === 'staff' && notification.userId !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
