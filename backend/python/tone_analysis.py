#!/usr/bin/env python3
"""
Tone Analysis
Analyzes speech tone including pitch variation, monotone detection, and energy
"""

import sys
import json
import numpy as np
import librosa
from pathlib import Path

def analyze_tone(audio_file_path):
    """
    Analyze speech tone
    
    Args:
        audio_file_path: Path to audio file
        
    Returns:
        dict: Tone analysis results
    """
    try:
        # Check if file exists
        if not Path(audio_file_path).exists():
            return {
                "success": False,
                "error": f"Audio file not found: {audio_file_path}"
            }
        
        # Load audio file
        y, sr = librosa.load(audio_file_path, sr=None)
        
        # Extract pitch (fundamental frequency)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        
        # Get pitch values (filter out zeros)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        if len(pitch_values) == 0:
            return {
                "success": False,
                "error": "Could not extract pitch information"
            }
        
        # Calculate pitch statistics
        mean_pitch = np.mean(pitch_values)
        std_pitch = np.std(pitch_values)
        pitch_range = np.max(pitch_values) - np.min(pitch_values)
        
        # Calculate coefficient of variation for pitch
        cv_pitch = (std_pitch / mean_pitch) * 100 if mean_pitch > 0 else 0
        
        # Analyze energy/volume
        energy = librosa.feature.rms(y=y)[0]
        mean_energy = np.mean(energy)
        std_energy = np.std(energy)
        cv_energy = (std_energy / mean_energy) * 100 if mean_energy > 0 else 0
        
        # Detect monotone (low pitch variation)
        is_monotone = cv_pitch < 10
        
        # Calculate tone score (0-100)
        tone_score = calculate_tone_score(cv_pitch, cv_energy, is_monotone)
        
        # Generate feedback
        feedback = generate_tone_feedback(
            tone_score,
            cv_pitch,
            cv_energy,
            is_monotone,
            mean_pitch
        )
        
        return {
            "success": True,
            "score": round(tone_score),
            "pitchVariation": round(cv_pitch, 2),
            "energyVariation": round(cv_energy, 2),
            "isMonotone": is_monotone,
            "meanPitch": round(mean_pitch, 2),
            "pitchRange": round(pitch_range, 2),
            "feedback": feedback
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Tone analysis error: {str(e)}"
        }

def calculate_tone_score(cv_pitch, cv_energy, is_monotone):
    """Calculate tone score based on variation metrics"""
    # Ideal pitch variation: 15-30%
    # Ideal energy variation: 20-40%
    
    score = 50  # Base score
    
    # Pitch variation scoring
    if 15 <= cv_pitch <= 30:
        score += 30  # Optimal variation
    elif 10 <= cv_pitch < 15 or 30 < cv_pitch <= 40:
        score += 20  # Good variation
    elif cv_pitch < 10:
        score += 5   # Too monotone
    else:
        score += 15  # Too much variation
    
    # Energy variation scoring
    if 20 <= cv_energy <= 40:
        score += 20  # Optimal energy variation
    elif 15 <= cv_energy < 20 or 40 < cv_energy <= 50:
        score += 15  # Good variation
    elif cv_energy < 15:
        score += 5   # Too flat
    else:
        score += 10  # Too much variation
    
    # Penalty for monotone
    if is_monotone:
        score -= 20
    
    return max(0, min(100, score))

def generate_tone_feedback(score, cv_pitch, cv_energy, is_monotone, mean_pitch):
    """Generate human-readable feedback"""
    feedback = []
    
    if score >= 80:
        feedback.append("Excellent tone! Your voice has great variation and expressiveness.")
    elif score >= 60:
        feedback.append("Good tone with decent variation. Minor improvements possible.")
    elif score >= 40:
        feedback.append("Moderate tone quality. Work on adding more vocal variety.")
    else:
        feedback.append("Tone needs improvement. Focus on varying your pitch and energy.")
    
    if is_monotone:
        feedback.append("Your speech sounds monotone. Try varying your pitch more to add emphasis and keep listeners engaged.")
    elif cv_pitch < 15:
        feedback.append("Limited pitch variation detected. Add more vocal inflection to emphasize key points.")
    elif cv_pitch > 40:
        feedback.append("Very high pitch variation. While expressiveness is good, ensure it doesn't distract from your message.")
    else:
        feedback.append("Good pitch variation! Your voice has natural expressiveness.")
    
    if cv_energy < 15:
        feedback.append("Your volume is quite consistent. Try varying your energy level to emphasize important points.")
    elif cv_energy > 50:
        feedback.append("High energy variation detected. Maintain more consistent volume for better clarity.")
    else:
        feedback.append("Good energy variation! You're using volume effectively.")
    
    return " ".join(feedback)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Audio file path required"
        }))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = analyze_tone(audio_path)
    print(json.dumps(result))
