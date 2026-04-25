const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusController');
// Reusing some auth/role middleware if possible, but I'll define simple checks or use existing ones
// Let's check userRoutes for admin middleware

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, syllabusController.getAllSyllabus);
router.get('/download/:id', protect, syllabusController.downloadSyllabus);
router.post('/', protect, admin, upload.single('file'), syllabusController.createSyllabus);
router.delete('/:id', protect, admin, syllabusController.deleteSyllabus);

module.exports = router;
