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
const processPayment = async (req, res) => {
    // For manual/card payments (Old Logic) or Razorpay Verification (New Logic)
    const { courseId, amount, method, transactionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // Razorpay Verification
        if (method === 'Razorpay' && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto.createHmac('sha256', 'YourKeySecretHere') // Must match key_secret above
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Invalid Signature' });
            }
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

        // Fetch Course to get duration
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // 1. Create Payment Record
        const payment = await Payment.create({
            userId: req.user.id,
            courseId,
            amount,
            method,
            transactionId: transactionId || razorpay_payment_id || `TXN-${Date.now()}`,
            status: 'completed'
        });

        // 2. Create Enrollment Booking with Expiration
        let expiresAt = null;
        if (course.duration) {
            expiresAt = new Date(Date.now() + course.duration * 60 * 1000); // Minutes to Milliseconds
        }

        await Booking.create({
            userId: req.user.id,
            courseId,
            type: 'course',
            status: 'confirmed',
            date: new Date(),
            expiresAt: expiresAt
        });

        // 3. Create Notification
        const { Notification } = require('../models');
        await Notification.create({
            userId: req.user.id,
            message: `Successfully enrolled in ${course.title}. ${expiresAt ? 'Access expires on ' + expiresAt.toLocaleString() : 'Lifetime Access.'}`,
            isRead: false
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error("Payment Processing Error:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Transaction ID already exists. Please check your ID.' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation Error', error: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: 'Payment processing failed', error: error.message, details: error });
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
    getAllPayments,
    getMyPayments,
    createRazorpayOrder,
    deletePayment
};
