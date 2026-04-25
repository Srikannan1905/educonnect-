const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetypes = /image\/jpeg|image\/png|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/csv|application\/vnd.ms-excel/;
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images, Documents (PDF/DOC), and CSV only!');
    }
}

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
