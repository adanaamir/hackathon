const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Create user with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || null
                }
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name
            },
            session: data.session
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return session
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name
            },
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * POST /api/auth/logout
 * Sign out user (requires authentication)
 */
router.post('/logout', authenticateUser, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

/**
 * GET /api/auth/session
 * Validate current session and return user info
 */
router.get('/session', authenticateUser, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.user_metadata?.full_name,
                createdAt: req.user.created_at
            }
        });
    } catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate session'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }

        res.json({
            success: true,
            session: data.session
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

module.exports = router;
