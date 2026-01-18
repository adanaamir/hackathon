const { supabase } = require('../config/supabase');
const { runPythonScript, runFullAnalysis } = require('../utils/pythonRunner');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload and save speech audio file
 */
const uploadSpeech = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        const { context } = req.body;

        if (!context || context.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Speech context is required'
            });
        }

        // Create speech session in database using user-specific client
        const { data: session, error: dbError } = await req.supabase
            .from('speech_sessions')
            .insert({
                id: uuidv4(),
                user_id: req.user.id,
                context: context.trim(),
                audio_file_path: req.file.path,
                transcription: null // Will be filled during analysis
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Clean up uploaded file
            await fs.unlink(req.file.path).catch(console.error);
            return res.status(500).json({
                success: false,
                error: 'Failed to save speech session'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Speech uploaded successfully',
            session: {
                id: session.id,
                context: session.context,
                createdAt: session.created_at
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up uploaded file if it exists
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload speech'
        });
    }
};

/**
 * Analyze uploaded speech
 */
const analyzeSpeech = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }

        // Get speech session
        const { data: session, error: sessionError } = await req.supabase
            .from('speech_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', req.user.id)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: 'Speech session not found'
            });
        }

        // Check if already analyzed
        const { data: existingAnalysis } = await req.supabase
            .from('analysis_results')
            .select('*')
            .eq('session_id', sessionId)
            .single();

        if (existingAnalysis) {
            return res.json({
                success: true,
                message: 'Analysis already exists',
                analysis: existingAnalysis
            });
        }

        // Step 1: Speech-to-text
        const transcriptionResult = await runPythonScript('speech_to_text', [session.audio_file_path]);

        if (!transcriptionResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Speech-to-text conversion failed',
                details: transcriptionResult.error
            });
        }

        const transcription = transcriptionResult.transcription;

        // Update session with transcription
        await req.supabase
            .from('speech_sessions')
            .update({ transcription })
            .eq('id', sessionId);

        // Step 2: Run full analysis
        const analysisResults = await runFullAnalysis(session.audio_file_path, transcription);

        // Step 3: Save analysis results
        const { data: analysis, error: analysisError } = await req.supabase
            .from('analysis_results')
            .insert({
                id: uuidv4(),
                session_id: sessionId,
                fluency_score: analysisResults.fluency.score,
                pace_score: analysisResults.pace.score,
                tone_score: analysisResults.tone.score,
                confidence_score: analysisResults.confidence.score,
                overall_score: analysisResults.overallScore,
                filler_words: analysisResults.fluency.fillerWords || [],
                wpm: analysisResults.pace.wpm || 0,
                feedback: {
                    fluency: analysisResults.fluency.feedback,
                    pace: analysisResults.pace.feedback,
                    tone: analysisResults.tone.feedback,
                    confidence: analysisResults.confidence.feedback
                }
            })
            .select()
            .single();

        if (analysisError) {
            console.error('Failed to save analysis:', analysisError);
            return res.status(500).json({
                success: false,
                error: 'Failed to save analysis results'
            });
        }

        res.json({
            success: true,
            message: 'Analysis completed successfully',
            analysis: {
                ...analysis,
                transcription,
                context: session.context
            }
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Analysis failed',
            details: error.message
        });
    }
};

/**
 * Get user's speech history
 */
const getSpeechHistory = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        // Get sessions with their analysis results
        const { data: sessions, error } = await req.supabase
            .from('speech_sessions')
            .select(`
        id,
        context,
        created_at,
        analysis_results (
          overall_score,
          fluency_score,
          pace_score,
          tone_score,
          confidence_score
        )
      `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch speech history'
            });
        }

        res.json({
            success: true,
            history: sessions,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: sessions.length
            }
        });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
        });
    }
};

/**
 * Get specific analysis result
 */
const getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get session with analysis
        const { data: session, error: sessionError } = await req.supabase
            .from('speech_sessions')
            .select(`
        *,
        analysis_results (*)
      `)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: 'Analysis not found'
            });
        }

        res.json({
            success: true,
            session: {
                id: session.id,
                context: session.context,
                transcription: session.transcription,
                createdAt: session.created_at
            },
            analysis: session.analysis_results[0] || null
        });
    } catch (error) {
        console.error('Fetch analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analysis'
        });
    }
};

/**
 * Delete speech session and analysis
 */
const deleteSpeech = async (req, res) => {
    try {
        const { id } = req.params;

        // Get session to verify ownership and get file path
        const { data: session, error: sessionError } = await req.supabase
            .from('speech_sessions')
            .select('audio_file_path')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: 'Speech session not found'
            });
        }

        // Delete from database (cascade will delete analysis_results)
        const { error: deleteError } = await req.supabase
            .from('speech_sessions')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete speech session'
            });
        }

        // Delete audio file
        if (session.audio_file_path) {
            await fs.unlink(session.audio_file_path).catch(err => {
                console.error('Failed to delete audio file:', err);
            });
        }

        res.json({
            success: true,
            message: 'Speech session deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete speech session'
        });
    }
};

module.exports = {
    uploadSpeech,
    analyzeSpeech,
    getSpeechHistory,
    getAnalysisById,
    deleteSpeech
};
