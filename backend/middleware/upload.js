const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-userid-originalname
        const userId = req.user?.id || 'anonymous';
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${userId}-${sanitizedName}`;
        cb(null, filename);
    }
});

// File filter - only allow audio files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'audio/mpeg',      // mp3
        'audio/wav',       // wav
        'audio/wave',      // wav alternative
        'audio/x-wav',     // wav alternative
        'audio/webm',      // webm
        'audio/ogg',       // ogg
        'audio/mp4',       // m4a, mp4
        'audio/x-m4a',     // m4a alternative
        'video/mp4',       // mp4 (often detected as video)
    ];

    const allowedExtensions = ['.mp3', '.wav', '.webm', '.ogg', '.m4a', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed (mp3, wav, webm, ogg, m4a, mp4)'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024 // Convert MB to bytes
    }
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 50}MB`
            });
        }
        return res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

module.exports = { upload, handleUploadError };
