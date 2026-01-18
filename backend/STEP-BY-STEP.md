# 🎯 STEP-BY-STEP: How to Test Your Backend

## ✅ Your Backend is RUNNING on http://localhost:5000

Follow these steps **exactly** - copy and paste each command into PowerShell.

---

## 📝 STEP 1: Open a New PowerShell Window

1. Press `Win + X`
2. Click "Windows PowerShell" or "Terminal"
3. Navigate to your project:
   ```powershell
   cd C:\Users\USER\OneDrive\Desktop\hackathon\backend
   ```

---

## 🔐 STEP 2: Login and Get Your Token

Copy and paste this **entire block** into PowerShell:

```powershell
$loginData = @{
    email = "demo@test.com"
    password = "demo123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"

$token = $response.session.access_token

Write-Host "✓ Login successful!" -ForegroundColor Green
Write-Host "User: $($response.user.email)"
Write-Host "`nYour token:" -ForegroundColor Cyan
Write-Host $token
```

**What you'll see:**
```
✓ Login successful!
User: demo@test.com

Your token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ STEP 3: Test Your Session

```powershell
$headers = @{ Authorization = "Bearer $token" }

$session = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers $headers

Write-Host "✓ Session valid!" -ForegroundColor Green
$session.user
```

**What you'll see:**
```
✓ Session valid!
id        : abc123...
email     : demo@test.com
fullName  : Demo User
```

---

## 📊 STEP 4: Check Your Speech History

```powershell
$history = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers $headers

Write-Host "✓ Found $($history.history.Count) speech sessions" -ForegroundColor Green
$history.history
```

---

## 🎤 STEP 5: Upload Audio File (Optional)

**First, you need an audio file:**
- Record yourself speaking for 30-60 seconds
- Save it as `test-speech.mp3` (or .wav, .webm, .ogg)
- Put it on your Desktop

**Then upload it:**

```powershell
# Change this path to your actual audio file
$audioFile = "C:\Users\USER\Desktop\test-speech.mp3"

$form = @{
    audio = Get-Item $audioFile
    context = "Practice presentation about AI"
}

$upload = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers $headers

Write-Host "✓ Audio uploaded!" -ForegroundColor Green
Write-Host "Session ID: $($upload.session.id)"

# Save the session ID
$sessionId = $upload.session.id
```

---

## 🤖 STEP 6: Analyze Your Speech (AI Magic!)

```powershell
$analyzeData = @{
    sessionId = $sessionId
} | ConvertTo-Json

$analysis = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/analyze" -Method POST -Body $analyzeData -ContentType "application/json" -Headers $headers

Write-Host "✓ Analysis complete!" -ForegroundColor Green
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Overall Score: $($analysis.analysis.overall_score)/100"
Write-Host "Fluency: $($analysis.analysis.fluency_score)/100"
Write-Host "Pace: $($analysis.analysis.pace_score)/100 ($($analysis.analysis.wpm) WPM)"
Write-Host "Tone: $($analysis.analysis.tone_score)/100"
Write-Host "Confidence: $($analysis.analysis.confidence_score)/100"
Write-Host "`nTranscription:"
Write-Host $analysis.analysis.transcription
Write-Host "`nFeedback:"
$analysis.analysis.feedback
```

**What you'll get:**
- ✅ **Transcription** of your speech
- ✅ **Fluency Score** (filler words analysis)
- ✅ **Pace Score** (words per minute)
- ✅ **Tone Score** (pitch variation)
- ✅ **Confidence Score** (voice stability)
- ✅ **Detailed Feedback** for improvement

---

## 🎨 Alternative: Use a GUI Tool

### Option 1: Thunder Client (Recommended)

1. Open VS Code
2. Install "Thunder Client" extension
3. Click Thunder Client icon in sidebar
4. Create new request:
   - **URL:** `http://localhost:5000/api/auth/login`
   - **Method:** POST
   - **Body (JSON):**
     ```json
     {
       "email": "demo@test.com",
       "password": "demo123"
     }
     ```
5. Click "Send"
6. Copy the `access_token`
7. Use it in other requests with "Auth" → "Bearer Token"

### Option 2: Postman

Same process as Thunder Client, but in the Postman app.

---

## 📝 Quick Reference

### All API Endpoints:

| Endpoint | Method | Auth? | Purpose |
|----------|--------|-------|---------|
| `/api/auth/signup` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login |
| `/api/auth/session` | GET | Yes | Validate session |
| `/api/speech/upload` | POST | Yes | Upload audio |
| `/api/speech/analyze` | POST | Yes | Analyze speech |
| `/api/speech/history` | GET | Yes | Get history |
| `/api/speech/:id` | GET | Yes | Get specific analysis |

---

## 🐛 Common Issues

**"Cannot find file"**
- Make sure the audio file path is correct
- Use full path: `C:\Users\USER\Desktop\file.mp3`

**"Invalid token"**
- Login again to get a fresh token
- Tokens expire after some time

**"Python script failed"**
- Make sure Python is installed
- Run: `python --version` to check

---

## ✅ What's Working

Your backend has:
- ✅ User authentication (signup/login)
- ✅ Protected API endpoints
- ✅ Audio file upload
- ✅ AI speech analysis (5 ML scripts)
- ✅ Database storage (Supabase)
- ✅ Speech history tracking

**Next step:** Build a frontend to make it user-friendly! 🎨
