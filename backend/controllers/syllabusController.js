const { Syllabus } = require('../models');
const path = require('path');

exports.getAllSyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(syllabus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSyllabus = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
        const fileName = req.file.originalname;
        const fileType = path.extname(req.file.originalname).replace('.', '').toLowerCase();
        const fileSize = (req.file.size / 1024 / 1024).toFixed(2) + ' MB';

        const newSyllabus = await Syllabus.create({
            title,
            description,
            fileUrl,
            fileType,
            fileName,
            fileSize
        });

        res.status(201).json(newSyllabus);
    } catch (error) {
        console.error('Syllabus Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.findByPk(req.params.id);
        if (!syllabus) return res.status(404).json({ message: 'Syllabus not found' });

        await syllabus.destroy();
        res.json({ message: 'Syllabus deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.downloadSyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.findByPk(req.params.id);
        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus document not found' });
        }

        // Construct the absolute path
        // The fileUrl is saved as "/uploads/file-..."
        const filePath = path.join(__dirname, '..', syllabus.fileUrl);

        // Use res.download to serve the file with the original filename
        res.download(filePath, syllabus.fileName, (err) => {
            if (err) {
                console.error('Download Error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error during file download' });
                }
            }
        });
    } catch (error) {
        console.error('Download Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};
