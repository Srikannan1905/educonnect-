const { Payment, Booking, Course } = require('../models');

// @desc    Process a new payment
// @route   POST /api/payments
// @access  Private
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// WARNING: Using Test Keys. Move to .env for production.
const razorpay = new Razorpay({
    key_id: 'rzp_test_YourKeyIdHere', // User needs to replace this
    key_secret: 'YourKeySecretHere'
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Razorpay Order Creation Failed' });
    }
};

// @desc    Process a new payment (Verify & Book)
// @route   POST /api/payments
// @access  Private
// @desc    Process a new payment (QR Code Manual)
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
    // For manual QR payments
    const { courseId, amount, transactionId } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        if (!screenshotUrl) {
            return res.status(400).json({ message: 'Screenshot is required for verification.' });
        }

        // 0. Check for Existing Active Booking
        const { Op } = require('sequelize');
        const existingBooking = await Booking.findOne({
            where: {
                userId: req.user.id,
                courseId,
                status: 'confirmed',
                [Op.or]: [
                    { expiresAt: null }, // Lifetime
                    { expiresAt: { [Op.gt]: new Date() } } // Not yet expired
                ]
            }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You already have an active booking for this course.' });
        }

        // Fetch Course to ensure it exists
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // 1. Create Pending Payment Record
        const payment = await Payment.create({
            userId: req.user.id,
            courseId,
            amount,
            method: 'UPI QR',
            transactionId: transactionId || `TXN-${Date.now()}`,
            status: 'pending',
            screenshotUrl: screenshotUrl
        });

        // 2. Notification for User
        const { Notification } = require('../models');
        await Notification.create({
            userId: req.user.id,
            message: `Your payment of ₹${amount} for ${course.title} is pending verification. We will notify you once approved.`,
            isRead: false
        });

        res.status(201).json({ message: 'Payment submitted successfully. Awaiting admin verification', payment });
    } catch (error) {
        console.error("Payment Processing Error:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Transaction ID already exists. Please check your ID.' });
        }
        res.status(400).json({ message: 'Payment processing failed', error: error.message });
    }
};

// @desc    Verify a pending manual payment
// @route   POST /api/payments/:id/verify
// @access  Private/Admin
const verifyPayment = async (req, res) => {
    try {
        const { status } = req.body; // 'completed' or 'failed'
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        if (payment.status !== 'pending') return res.status(400).json({ message: `Payment is already ${payment.status}` });

        if (status === 'failed') {
            await payment.update({ status: 'failed' });
            return res.json({ message: 'Payment rejected', payment });
        }

        // Fetch Course to get duration
        const course = await Course.findByPk(payment.courseId);

        // Calculate Expiration
        let expiresAt = null;
        if (course.duration) {
            expiresAt = new Date(Date.now() + course.duration * 60 * 1000);
        }

        // Create Enrollment Booking
        await Booking.create({
            userId: payment.userId,
            courseId: payment.courseId,
            type: 'course',
            status: 'confirmed',
            date: new Date(),
            expiresAt: expiresAt
        });

        // Update Payment Status
        await payment.update({ status: 'completed' });

        // Notify User
        const { Notification } = require('../models');
        await Notification.create({
            userId: payment.userId,
            message: `Your payment for ${course.title} has been verified and approved! ${expiresAt ? 'Access expires on ' + expiresAt.toLocaleString() : 'Lifetime Access.'}`,
            isRead: false
        });

        res.json({ message: 'Payment verified successfully', payment });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};


// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: ['User', 'Course'], // We need to set up these associations in models/index.js
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my payments (Student)
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.user.id },
            include: ['Course'],
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a payment (Admin)
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        await payment.destroy();
        res.json({ message: 'Payment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processPayment,
    verifyPayment,
    getAllPayments,
    getMyPayments,
    createRazorpayOrder,
    deletePayment
};
