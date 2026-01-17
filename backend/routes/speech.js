const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
    uploadSpeech,
    analyzeSpeech,
    getSpeechHistory,
    getAnalysisById,
    deleteSpeech
} = require('../controllers/speechController');

/**
 * POST /api/speech/upload
 * Upload audio file and create speech session
 * Requires authentication
 */
router.post(
    '/upload',
    authenticateUser,
    upload.single('audio'),
    handleUploadError,
    uploadSpeech
);

/**
 * POST /api/speech/analyze
 * Analyze uploaded speech
 * Requires authentication
 * Body: { sessionId: string }
 */
router.post('/analyze', authenticateUser, analyzeSpeech);

/**
 * GET /api/speech/history
 * Get user's speech analysis history
 * Requires authentication
 * Query params: limit (default 10), offset (default 0)
 */
router.get('/history', authenticateUser, getSpeechHistory);

/**
 * GET /api/speech/:id
 * Get specific speech analysis by ID
 * Requires authentication
 */
router.get('/:id', authenticateUser, getAnalysisById);

/**
 * DELETE /api/speech/:id
 * Delete speech session and analysis
 * Requires authentication
 */
router.delete('/:id', authenticateUser, deleteSpeech);

module.exports = router;
