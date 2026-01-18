# SpeakSmart API Testing Guide

## Quick Test Using PowerShell

### 1. Register a New User

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "fullName": "Test User"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "..."
  }
}
```

---

### 2. Login (Get Access Token)

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Save the token for later use
$token = $response.session.access_token
Write-Host "Token saved: $token"
```

---

### 3. Test Protected Endpoint (Validate Session)

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

---

### 4. Upload Audio File (Speech Analysis)

First, you need an audio file. For testing, you can:
- Record a short speech (30-60 seconds)
- Save it as MP3, WAV, or WebM
- Place it in a known location

```powershell
# Set your audio file path
$audioFile = "C:\path\to\your\audio.mp3"

# Create multipart form data
$form = @{
    audio = Get-Item -Path $audioFile
    context = "Practice presentation about AI"
}

$headers = @{
    "Authorization" = "Bearer $token"
}

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers $headers

# Save session ID
$sessionId = $uploadResponse.session.id
Write-Host "Session ID: $sessionId"
```

---

### 5. Analyze the Speech

```powershell
$body = @{
    sessionId = $sessionId
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

$analysisResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/analyze" -Method POST -Body $body -ContentType "application/json" -Headers $headers

# Display results
$analysisResponse.analysis | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "fluency_score": 85,
    "pace_score": 78,
    "tone_score": 82,
    "confidence_score": 80,
    "overall_score": 81,
    "wpm": 135,
    "filler_words": [
      { "word": "um", "count": 3 }
    ],
    "feedback": {
      "fluency": "Good fluency overall...",
      "pace": "Excellent pace at 135 WPM...",
      "tone": "Good pitch variation...",
      "confidence": "Good confidence level..."
    },
    "transcription": "Your speech text here..."
  }
}
```

---

### 6. Get Your Speech History

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history?limit=10" -Method GET -Headers $headers
```

---

## Complete Test Script (Copy & Run)

Save this as `test-api.ps1`:

```powershell
# SpeakSmart API Test Script

Write-Host "=== SpeakSmart API Testing ===" -ForegroundColor Cyan

# 1. Register User
Write-Host "`n1. Registering new user..." -ForegroundColor Yellow
$signupBody = @{
    email = "test@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "✓ User registered successfully!" -ForegroundColor Green
} catch {
    Write-Host "Note: User might already exist, trying login..." -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.session.access_token
Write-Host "✓ Login successful!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Gray

# 3. Validate Session
Write-Host "`n3. Validating session..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$sessionResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers
Write-Host "✓ Session valid! User: $($sessionResponse.user.email)" -ForegroundColor Green

# 4. Get History
Write-Host "`n4. Fetching speech history..." -ForegroundColor Yellow
$historyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers $headers
Write-Host "✓ Found $($historyResponse.history.Count) previous sessions" -ForegroundColor Green

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Cyan
Write-Host "`nYour access token (save this):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor White

Write-Host "`nTo upload audio, run:" -ForegroundColor Yellow
Write-Host '$form = @{ audio = Get-Item "path\to\audio.mp3"; context = "Test speech" }' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers @{"Authorization"="Bearer $token"}' -ForegroundColor White
```

Run it:
```powershell
cd C:\Users\USER\OneDrive\Desktop\hackathon\backend
.\test-api.ps1
```

---

## Alternative: Use Postman or Thunder Client

If you prefer a GUI tool:

1. **Install Thunder Client** (VS Code Extension) or **Postman**

2. **Import this collection:**
   - Base URL: `http://localhost:5000`
   - Create requests for each endpoint
   - Use the token from login in Authorization header

---

## Need a Test Audio File?

You can:
1. **Record yourself** speaking for 30-60 seconds
2. **Use online TTS** to generate test audio
3. **Download a sample** from freesound.org

Save as: `test-speech.mp3` or `test-speech.wav`

---

## What Each Analysis Score Means:

- **Fluency Score (0-100)**: Fewer filler words = higher score
- **Pace Score (0-100)**: 120-150 WPM is optimal
- **Tone Score (0-100)**: Good pitch variation = higher score  
- **Confidence Score (0-100)**: Stable voice, fewer hesitations = higher score
- **Overall Score**: Average of all four scores
