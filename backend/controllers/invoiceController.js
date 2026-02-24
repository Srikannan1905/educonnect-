const { Payment, User, Course, Company } = require('../models');

// @desc    Get invoice data for a specific payment
// @route   GET /api/invoices/:paymentId
// @access  Private
exports.getInvoiceData = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.paymentId, {
            include: [
                { model: User, attributes: ['name', 'email', 'phone', 'address'] },
                { model: Course, attributes: ['title', 'description', 'price'] }
            ]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Security Check: Student can only see their own invoices
        if (req.user.role === 'student' && payment.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this invoice' });
        }

        // Fetch Company Settings for Header
        const company = await Company.findOne();

        res.json({
            payment,
            company: company || {
                name: 'EduConnect',
                email: 'contact@educonnect.com',
                phone: '+91 9876543210',
                address: '123 Education Lane, Learning City'
            }
        });
    } catch (error) {
        console.error('Invoice Data Error Details:', {
            message: error.message,
            stack: error.stack,
            params: req.params,
            user: req.user ? { id: req.user.id, role: req.user.role } : 'No User'
        });
        res.status(500).json({
            message: 'Error fetching invoice data',
            details: error.message
        });
    }
};
