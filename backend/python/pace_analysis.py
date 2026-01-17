#!/usr/bin/env python3
"""
Pace Analysis
Analyzes speech pace (words per minute) and speaking rate variation
"""

import sys
import json
import librosa
from pathlib import Path

# Optimal speaking pace ranges (words per minute)
OPTIMAL_WPM_MIN = 120
OPTIMAL_WPM_MAX = 150
SLOW_WPM = 100
FAST_WPM = 180

def analyze_pace(audio_file_path, transcription):
    """
    Analyze speech pace
    
    Args:
        audio_file_path: Path to audio file
        transcription: Text transcription
        
    Returns:
        dict: Pace analysis results
    """
    try:
        # Check if file exists
        if not Path(audio_file_path).exists():
            return {
                "success": False,
                "error": f"Audio file not found: {audio_file_path}"
            }
        
        if not transcription or len(transcription.strip()) == 0:
            return {
                "success": False,
                "error": "Empty transcription"
            }
        
        # Load audio file
        y, sr = librosa.load(audio_file_path, sr=None)
        
        # Calculate duration in minutes
        duration_seconds = librosa.get_duration(y=y, sr=sr)
        duration_minutes = duration_seconds / 60.0
        
        if duration_minutes == 0:
            return {
                "success": False,
                "error": "Audio duration is zero"
            }
        
        # Count words
        word_count = len(transcription.split())
        
        # Calculate words per minute
        wpm = word_count / duration_minutes
        
        # Calculate pace score (0-100)
        pace_score = calculate_pace_score(wpm)
        
        # Analyze speech rate variation
        variation_analysis = analyze_rate_variation(y, sr)
        
        # Generate feedback
        feedback = generate_pace_feedback(wpm, pace_score, duration_seconds)
        
        return {
            "success": True,
            "score": round(pace_score),
            "wpm": round(wpm),
            "duration": round(duration_seconds, 2),
            "wordCount": word_count,
            "paceCategory": categorize_pace(wpm),
            "variation": variation_analysis,
            "feedback": feedback
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Pace analysis error: {str(e)}"
        }

def calculate_pace_score(wpm):
    """Calculate pace score based on WPM"""
    if OPTIMAL_WPM_MIN <= wpm <= OPTIMAL_WPM_MAX:
        # Perfect range
        return 100
    elif wpm < OPTIMAL_WPM_MIN:
        # Too slow
        if wpm < SLOW_WPM:
            return max(0, 40 - (SLOW_WPM - wpm) * 0.5)
        else:
            return 40 + ((wpm - SLOW_WPM) / (OPTIMAL_WPM_MIN - SLOW_WPM)) * 40
    else:
        # Too fast
        if wpm > FAST_WPM:
            return max(0, 40 - (wpm - FAST_WPM) * 0.5)
        else:
            return 40 + ((FAST_WPM - wpm) / (FAST_WPM - OPTIMAL_WPM_MAX)) * 40

def categorize_pace(wpm):
    """Categorize speaking pace"""
    if wpm < SLOW_WPM:
        return "Very Slow"
    elif wpm < OPTIMAL_WPM_MIN:
        return "Slow"
    elif wpm <= OPTIMAL_WPM_MAX:
        return "Optimal"
    elif wpm <= FAST_WPM:
        return "Fast"
    else:
        return "Very Fast"

def analyze_rate_variation(y, sr):
    """Analyze speech rate variation"""
    try:
        # Simple variation analysis based on energy
        # More sophisticated analysis could use syllable detection
        hop_length = 512
        energy = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        
        # Calculate coefficient of variation
        import numpy as np
        if len(energy) > 0 and np.mean(energy) > 0:
            cv = (np.std(energy) / np.mean(energy)) * 100
            
            if cv < 20:
                return "Low variation (monotonous)"
            elif cv < 40:
                return "Moderate variation"
            else:
                return "High variation (dynamic)"
        else:
            return "Unable to analyze"
    except:
        return "Unable to analyze"

def generate_pace_feedback(wpm, score, duration):
    """Generate human-readable feedback"""
    feedback = []
    
    if score >= 80:
        feedback.append(f"Excellent pace at {round(wpm)} words per minute! You're speaking at an ideal rate.")
    elif score >= 60:
        feedback.append(f"Good pace at {round(wpm)} WPM, close to the optimal range of {OPTIMAL_WPM_MIN}-{OPTIMAL_WPM_MAX} WPM.")
    else:
        feedback.append(f"Your pace of {round(wpm)} WPM could be improved.")
    
    if wpm < SLOW_WPM:
        feedback.append("You're speaking quite slowly. Try to increase your pace slightly to maintain audience engagement.")
    elif wpm < OPTIMAL_WPM_MIN:
        feedback.append("You're speaking a bit slowly. A slightly faster pace would improve clarity and engagement.")
    elif wpm > FAST_WPM:
        feedback.append("You're speaking very quickly. Slow down to ensure your audience can follow along.")
    elif wpm > OPTIMAL_WPM_MAX:
        feedback.append("You're speaking a bit fast. Slowing down slightly will improve comprehension.")
    
    if duration < 30:
        feedback.append("Note: Short speech duration may affect pace accuracy.")
    
    return " ".join(feedback)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Audio file path and transcription required"
        }))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    transcription = sys.argv[2]
    result = analyze_pace(audio_path, transcription)
    print(json.dumps(result))
