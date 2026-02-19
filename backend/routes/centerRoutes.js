const express = require('express');
const router = express.Router();
const {
    createCenter,
    getCenters,
    getCenterById,
    updateCenter,
    deleteCenter,
} = require('../controllers/centerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCenters)
    .post(protect, admin, createCenter);

router.route('/:id')
    .get(getCenterById)
    .put(protect, admin, updateCenter)
    .delete(protect, admin, deleteCenter);

module.exports = router;
