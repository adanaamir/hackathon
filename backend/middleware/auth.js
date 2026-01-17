const { supabase } = require('../config/supabase');

/**
 * Authentication middleware to protect routes
 * Validates JWT token from Authorization header
 */
const authenticateUser = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Attach user to request object
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block request
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user } } = await supabase.auth.getUser(token);

            if (user) {
                req.user = user;
                req.token = token;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = { authenticateUser, optionalAuth };
