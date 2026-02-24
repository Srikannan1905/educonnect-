const express = require('express');
const router = express.Router();
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    requestCourse,
    getCourseRequests,
    approveCourseRequest
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, admin, createCourse);

router.route('/request')
    .post(protect, requestCourse);

router.route('/requests')
    .get(protect, getCourseRequests);

router.route('/requests/:id')
    .put(protect, admin, approveCourseRequest);

router.route('/:id')
    .get(getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

module.exports = router;
