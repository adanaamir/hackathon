-- Create analysis_results table
-- This table stores AI analysis results for each speech session

CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.speech_sessions(id) ON DELETE CASCADE,
    fluency_score INTEGER NOT NULL CHECK (fluency_score >= 0 AND fluency_score <= 100),
    pace_score INTEGER NOT NULL CHECK (pace_score >= 0 AND pace_score <= 100),
    tone_score INTEGER NOT NULL CHECK (tone_score >= 0 AND tone_score <= 100),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    filler_words JSONB DEFAULT '[]'::jsonb,
    wpm INTEGER DEFAULT 0,
    feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_analysis_results_session_id ON public.analysis_results(session_id);

-- Create index on overall_score for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_analysis_results_overall_score ON public.analysis_results(overall_score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view analysis for their own sessions
CREATE POLICY "Users can view own analysis"
    ON public.analysis_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.speech_sessions
            WHERE speech_sessions.id = analysis_results.session_id
            AND speech_sessions.user_id = auth.uid()
        )
    );

-- Create policy: Users can insert analysis for their own sessions
CREATE POLICY "Users can insert own analysis"
    ON public.analysis_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.speech_sessions
            WHERE speech_sessions.id = analysis_results.session_id
            AND speech_sessions.user_id = auth.uid()
        )
    );

-- Create policy: Users can update analysis for their own sessions
CREATE POLICY "Users can update own analysis"
    ON public.analysis_results
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.speech_sessions
            WHERE speech_sessions.id = analysis_results.session_id
            AND speech_sessions.user_id = auth.uid()
        )
    );

-- Create policy: Users can delete analysis for their own sessions
CREATE POLICY "Users can delete own analysis"
    ON public.analysis_results
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.speech_sessions
            WHERE speech_sessions.id = analysis_results.session_id
            AND speech_sessions.user_id = auth.uid()
        )
    );

-- Add comments
COMMENT ON TABLE public.analysis_results IS 'Stores AI-generated analysis results for speech sessions';
COMMENT ON COLUMN public.analysis_results.filler_words IS 'JSON array of detected filler words with counts';
COMMENT ON COLUMN public.analysis_results.feedback IS 'JSON object containing detailed feedback for each category';
