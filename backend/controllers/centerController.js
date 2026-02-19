const { Center } = require('../models');

// @desc    Create a new center
// @route   POST /api/centers
// @access  Private/Admin
const createCenter = async (req, res) => {
    try {
        const center = await Center.create(req.body);
        res.status(201).json(center);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all centers
// @route   GET /api/centers
// @access  Public
const getCenters = async (req, res) => {
    try {
        const centers = await Center.findAll();
        res.json(centers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get center by ID
// @route   GET /api/centers/:id
// @access  Public
const getCenterById = async (req, res) => {
    try {
        const center = await Center.findByPk(req.params.id);
        if (center) {
            res.json(center);
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update center
// @route   PUT /api/centers/:id
// @access  Private/Admin
const updateCenter = async (req, res) => {
    try {
        const center = await Center.findByPk(req.params.id);
        if (center) {
            await center.update(req.body);
            res.json(center);
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete center
// @route   DELETE /api/centers/:id
// @access  Private/Admin
const deleteCenter = async (req, res) => {
    try {
        const center = await Center.findByPk(req.params.id);
        if (center) {
            await center.destroy();
            res.json({ message: 'Center removed' });
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCenter,
    getCenters,
    getCenterById,
    updateCenter,
    deleteCenter,
};
