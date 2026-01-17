#!/usr/bin/env python3
"""
Confidence Analysis
Analyzes speech confidence based on voice stability, hesitation, and clarity
"""

import sys
import json
import numpy as np
import librosa
from pathlib import Path

def analyze_confidence(audio_file_path, transcription):
    """
    Analyze speech confidence
    
    Args:
        audio_file_path: Path to audio file
        transcription: Text transcription
        
    Returns:
        dict: Confidence analysis results
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
        
        # Analyze voice stability (spectral centroid stability)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        centroid_stability = 100 - min(100, (np.std(spectral_centroids) / np.mean(spectral_centroids)) * 100)
        
        # Analyze energy consistency
        energy = librosa.feature.rms(y=y)[0]
        energy_consistency = 100 - min(100, (np.std(energy) / np.mean(energy)) * 100)
        
        # Detect pauses/hesitations
        # Identify silent segments
        intervals = librosa.effects.split(y, top_db=30)
        num_segments = len(intervals)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Calculate pause frequency (pauses per minute)
        pauses_per_minute = (num_segments - 1) / (duration / 60) if duration > 0 else 0
        
        # Analyze zero-crossing rate (voice clarity indicator)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        mean_zcr = np.mean(zcr)
        clarity_score = min(100, mean_zcr * 1000)  # Normalize
        
        # Text-based confidence indicators
        text_lower = transcription.lower()
        words = text_lower.split()
        
        # Detect hesitation words
        hesitation_words = ['um', 'uh', 'er', 'ah', 'hmm']
        hesitation_count = sum(1 for word in words if word in hesitation_words)
        hesitation_rate = (hesitation_count / len(words)) * 100 if len(words) > 0 else 0
        
        # Calculate overall confidence score
        confidence_score = calculate_confidence_score(
            centroid_stability,
            energy_consistency,
            pauses_per_minute,
            clarity_score,
            hesitation_rate
        )
        
        # Generate feedback
        feedback = generate_confidence_feedback(
            confidence_score,
            centroid_stability,
            pauses_per_minute,
            hesitation_count,
            len(words)
        )
        
        return {
            "success": True,
            "score": round(confidence_score),
            "voiceStability": round(centroid_stability, 2),
            "energyConsistency": round(energy_consistency, 2),
            "pausesPerMinute": round(pauses_per_minute, 2),
            "clarityScore": round(clarity_score, 2),
            "hesitationCount": hesitation_count,
            "hesitationRate": round(hesitation_rate, 2),
            "feedback": feedback
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Confidence analysis error: {str(e)}"
        }

def calculate_confidence_score(stability, consistency, pauses_pm, clarity, hesitation_rate):
    """Calculate overall confidence score"""
    # Weighted scoring
    score = 0
    
    # Voice stability (25%)
    score += (stability / 100) * 25
    
    # Energy consistency (20%)
    score += (consistency / 100) * 20
    
    # Pause frequency (20%)
    # Optimal: 2-4 pauses per minute
    if 2 <= pauses_pm <= 4:
        score += 20
    elif pauses_pm < 2:
        score += 15  # Too few pauses (might be rushing)
    elif pauses_pm <= 6:
        score += 15  # Slightly too many
    else:
        score += max(0, 20 - (pauses_pm - 6) * 2)  # Too many pauses
    
    # Clarity (20%)
    score += (min(clarity, 100) / 100) * 20
    
    # Hesitation rate (15%)
    if hesitation_rate < 2:
        score += 15
    elif hesitation_rate < 5:
        score += 10
    elif hesitation_rate < 8:
        score += 5
    else:
        score += 0
    
    return max(0, min(100, score))

def generate_confidence_feedback(score, stability, pauses_pm, hesitation_count, word_count):
    """Generate human-readable feedback"""
    feedback = []
    
    if score >= 80:
        feedback.append("Excellent confidence! You sound assured and authoritative.")
    elif score >= 60:
        feedback.append("Good confidence level. You sound generally comfortable.")
    elif score >= 40:
        feedback.append("Moderate confidence. Practice will help you sound more assured.")
    else:
        feedback.append("Low confidence detected. Focus on preparation and practice to build assurance.")
    
    if stability < 60:
        feedback.append("Your voice shows some instability. Take deep breaths and speak from your diaphragm.")
    elif stability >= 80:
        feedback.append("Great voice stability! You sound steady and controlled.")
    
    if pauses_pm > 6:
        feedback.append(f"High pause frequency ({round(pauses_pm)} per minute). This may indicate nervousness or uncertainty.")
    elif pauses_pm < 2:
        feedback.append("Very few pauses detected. Remember to breathe and give your audience time to absorb information.")
    else:
        feedback.append("Good use of pauses! They help emphasize key points.")
    
    if hesitation_count > word_count * 0.05:
        feedback.append(f"Detected {hesitation_count} hesitation sounds. Practice your content to reduce uncertainty.")
    elif hesitation_count == 0:
        feedback.append("No hesitation sounds detected - excellent!")
    
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
    result = analyze_confidence(audio_path, transcription)
    print(json.dumps(result))
