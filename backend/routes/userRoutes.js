const express = require('express');
const router = express.Router();
const { getUsers, getUserById, getStaffRequests, approveStaff, rejectStaff, getActivityLogs } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/public/instructors', require('../controllers/userController').getPublicInstructors);
router.get('/', protect, getUsers); // Changed: Removed 'admin' to allow staff/student viewing based on controller logic
router.get('/activities', protect, getActivityLogs);
router.get('/staff-requests', protect, admin, getStaffRequests);
router.put('/staff-requests/:id/approve', protect, admin, approveStaff);
router.put('/staff-requests/:id/reject', protect, admin, rejectStaff);

router.put('/profile/credentials', protect, require('../controllers/userController').updateCredentials);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, require('../controllers/userController').updateUser);
router.delete('/:id', protect, admin, require('../controllers/userController').deleteUser);

module.exports = router;
