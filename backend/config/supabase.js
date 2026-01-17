const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);

// Test connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('speech_sessions').select('count').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is fine
            console.warn('Supabase connection warning:', error.message);
        } else {
            console.log('✓ Supabase connected successfully');
        }
    } catch (err) {
        console.error('Supabase connection error:', err.message);
    }
};

module.exports = { supabase, testConnection };
