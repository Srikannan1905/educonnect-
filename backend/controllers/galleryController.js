const { Gallery } = require('../models');

// @desc    Get all photos
// @route   GET /api/gallery
// @access  Public
const getPhotos = async (req, res) => {
    try {
        const { category } = req.query;
        const whereClause = category ? { category } : {};
        const photos = await Gallery.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a photo
// @route   POST /api/gallery
// @access  Private/Admin
const addPhoto = async (req, res) => {
    try {
        const { title, imageUrl, category } = req.body;
        const photo = await Gallery.create({
            title,
            imageUrl,
            category: category || 'miscellaneous'
        });
        res.status(201).json(photo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a photo
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deletePhoto = async (req, res) => {
    try {
        const photo = await Gallery.findByPk(req.params.id);
        if (photo) {
            await photo.destroy();
            res.json({ message: 'Photo removed' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPhotos,
    addPhoto,
    deletePhoto,
};
