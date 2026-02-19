const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Admin)
router.put('/:id/read', protect, admin, async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (notification) {
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
