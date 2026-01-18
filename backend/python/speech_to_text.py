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
        import librosa
        import soundfile as sf
        import tempfile
        import os
        
        recognizer = sr.Recognizer()
        
        # Check if file exists
        if not Path(audio_file_path).exists():
            return {
                "success": False,
                "error": f"Audio file not found: {audio_file_path}"
            }
        
        # Get file extension
        file_ext = Path(audio_file_path).suffix.lower()
        
        # If not WAV, convert to WAV first using librosa
        if file_ext not in ['.wav', '.wave']:
            try:
                # Load audio file with librosa (supports many formats including MP4)
                audio_data, sample_rate = librosa.load(audio_file_path, sr=16000)
                
                # Create temporary WAV file
                temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
                temp_wav_path = temp_wav.name
                temp_wav.close()
                
                # Save as WAV
                sf.write(temp_wav_path, audio_data, sample_rate)
                audio_file_to_use = temp_wav_path
                cleanup_temp = True
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Failed to convert audio format: {str(e)}"
                }
        else:
            audio_file_to_use = audio_file_path
            cleanup_temp = False
        
        try:
            # Load audio file
            with sr.AudioFile(audio_file_to_use) as source:
                # Adjust for ambient noise
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Record audio
                audio = recognizer.record(source)
            
            # Perform speech recognition
            try:
                transcription = recognizer.recognize_google(audio)
                
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
        finally:
            # Clean up temporary file if created
            if cleanup_temp and os.path.exists(audio_file_to_use):
                try:
                    os.unlink(audio_file_to_use)
                except:
                    pass
            
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
