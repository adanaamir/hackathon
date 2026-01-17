#!/usr/bin/env python3
"""
Speech-to-Text Conversion
Converts audio file to text transcription using Google Speech Recognition
"""

import sys
import json
import speech_recognition as sr
from pathlib import Path

def speech_to_text(audio_file_path):
    """
    Convert audio file to text
    
    Args:
        audio_file_path: Path to audio file
        
    Returns:
        dict: {success: bool, transcription: str, error: str}
    """
    try:
        recognizer = sr.Recognizer()
        
        # Check if file exists
        if not Path(audio_file_path).exists():
            return {
                "success": False,
                "error": f"Audio file not found: {audio_file_path}"
            }
        
        # Load audio file
        with sr.AudioFile(audio_file_path) as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            # Record audio
            audio_data = recognizer.record(source)
        
        # Perform speech recognition
        try:
            transcription = recognizer.recognize_google(audio_data)
            
            return {
                "success": True,
                "transcription": transcription,
                "word_count": len(transcription.split())
            }
        except sr.UnknownValueError:
            return {
                "success": False,
                "error": "Could not understand audio. Please ensure clear speech."
            }
        except sr.RequestError as e:
            return {
                "success": False,
                "error": f"Speech recognition service error: {str(e)}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Transcription error: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Audio file path required"
        }))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = speech_to_text(audio_path)
    print(json.dumps(result))
