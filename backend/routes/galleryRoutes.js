const express = require('express');
const router = express.Router();
const { getPhotos, addPhoto, deletePhoto } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getPhotos)
    .post(protect, admin, addPhoto);

router.route('/:id')
    .delete(protect, admin, deletePhoto);

module.exports = router;
