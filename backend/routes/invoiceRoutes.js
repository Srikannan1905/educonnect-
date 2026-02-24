const express = require('express');
const router = express.Router();
const { getInvoiceData } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:paymentId', protect, getInvoiceData);

module.exports = router;
