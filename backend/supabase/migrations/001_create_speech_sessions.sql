-- Create speech_sessions table
-- This table stores information about each speech recording session

CREATE TABLE IF NOT EXISTS public.speech_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context TEXT NOT NULL,
    audio_file_path TEXT NOT NULL,
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_speech_sessions_user_id ON public.speech_sessions(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_speech_sessions_created_at ON public.speech_sessions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.speech_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.speech_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.speech_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.speech_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
    ON public.speech_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_speech_sessions_updated_at
    BEFORE UPDATE ON public.speech_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.speech_sessions IS 'Stores speech recording sessions with context and transcription';
