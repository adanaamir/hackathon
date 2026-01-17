#!/usr/bin/env python3
"""
Fluency Analysis
Analyzes speech for filler words, pauses, repetitions, and overall fluency
"""

import sys
import json
import re
from collections import Counter

# Common filler words and phrases
FILLER_WORDS = [
    'um', 'uh', 'uhm', 'ah', 'er', 'like', 'you know', 'i mean',
    'sort of', 'kind of', 'basically', 'actually', 'literally',
    'right', 'okay', 'so', 'well', 'just'
]

def analyze_fluency(transcription):
    """
    Analyze speech fluency
    
    Args:
        transcription: Text transcription of speech
        
    Returns:
        dict: Fluency analysis results
    """
    try:
        if not transcription or len(transcription.strip()) == 0:
            return {
                "success": False,
                "error": "Empty transcription"
            }
        
        # Normalize text
        text_lower = transcription.lower()
        words = text_lower.split()
        total_words = len(words)
        
        if total_words == 0:
            return {
                "success": False,
                "error": "No words in transcription"
            }
        
        # Detect filler words
        filler_count = 0
        detected_fillers = []
        
        for filler in FILLER_WORDS:
            # Count occurrences
            if ' ' in filler:
                # Multi-word filler
                count = text_lower.count(filler)
            else:
                # Single word filler (match whole words only)
                count = sum(1 for word in words if word == filler)
            
            if count > 0:
                filler_count += count
                detected_fillers.append({
                    "word": filler,
                    "count": count
                })
        
        # Calculate filler word percentage
        filler_percentage = (filler_count / total_words) * 100
        
        # Detect repetitions (same word used consecutively)
        repetitions = 0
        for i in range(len(words) - 1):
            if words[i] == words[i + 1] and len(words[i]) > 2:
                repetitions += 1
        
        # Calculate fluency score (0-100)
        # Lower filler percentage = higher score
        # Penalize for repetitions
        base_score = max(0, 100 - (filler_percentage * 2))
        repetition_penalty = min(repetitions * 5, 20)
        fluency_score = max(0, min(100, base_score - repetition_penalty))
        
        # Generate feedback
        feedback = generate_fluency_feedback(
            fluency_score,
            filler_percentage,
            filler_count,
            repetitions,
            total_words
        )
        
        return {
            "success": True,
            "score": round(fluency_score),
            "fillerWords": detected_fillers,
            "fillerCount": filler_count,
            "fillerPercentage": round(filler_percentage, 2),
            "repetitions": repetitions,
            "totalWords": total_words,
            "feedback": feedback
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Fluency analysis error: {str(e)}"
        }

def generate_fluency_feedback(score, filler_pct, filler_count, repetitions, total_words):
    """Generate human-readable feedback"""
    feedback = []
    
    if score >= 80:
        feedback.append("Excellent fluency! Your speech flows naturally with minimal interruptions.")
    elif score >= 60:
        feedback.append("Good fluency overall, with room for minor improvements.")
    elif score >= 40:
        feedback.append("Moderate fluency. Focus on reducing filler words and pauses.")
    else:
        feedback.append("Fluency needs improvement. Practice speaking more smoothly.")
    
    if filler_pct > 10:
        feedback.append(f"High filler word usage ({filler_count} fillers in {total_words} words). Try to pause silently instead of using filler words.")
    elif filler_pct > 5:
        feedback.append(f"Moderate filler word usage. Be mindful of words like 'um', 'uh', and 'like'.")
    else:
        feedback.append("Great job minimizing filler words!")
    
    if repetitions > 3:
        feedback.append(f"Detected {repetitions} word repetitions. Vary your vocabulary for better flow.")
    
    return " ".join(feedback)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Transcription text required"
        }))
        sys.exit(1)
    
    transcription = sys.argv[1]
    result = analyze_fluency(transcription)
    print(json.dumps(result))
