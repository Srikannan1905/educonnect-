const express = require('express');
const router = express.Router();
const { getUsers, getStaffRequests, approveStaff, rejectStaff } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/public/instructors', require('../controllers/userController').getPublicInstructors);
router.get('/', protect, getUsers); // Changed: Removed 'admin' to allow staff/student viewing based on controller logic
router.get('/staff-requests', protect, admin, getStaffRequests);
router.put('/staff-requests/:id/approve', protect, admin, approveStaff);
router.put('/staff-requests/:id/reject', protect, admin, rejectStaff);
router.put('/:id', protect, require('../controllers/userController').updateUser);
router.delete('/:id', protect, admin, require('../controllers/userController').deleteUser);

module.exports = router;
