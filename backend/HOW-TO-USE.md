# 🎯 How to Test Your StutterLess Backend

Your backend is **RUNNING** on `http://localhost:5000` ✅

## Quick Test (Copy & Paste These Commands)

### 1️⃣ Register a New User

Open PowerShell and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body '{"email":"demo@test.com","password":"demo123","fullName":"Demo User"}' -ContentType "application/json"
```

**You'll see:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": { "id": "...", "email": "demo@test.com" },
  "session": { "access_token": "eyJ..." }
}
```

---

### 2️⃣ Login and Get Token

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body '{"email":"demo@test.com","password":"demo123"}' -ContentType "application/json"
$token = $response.session.access_token
Write-Host "Your token: $token"
```

**Copy the token** - you'll need it for the next steps!

---

### 3️⃣ Test Protected Endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session" -Method GET -Headers @{Authorization="Bearer $token"}
```

**You'll see your user info** ✅

---

### 4️⃣ Upload Audio File for Analysis

**First, get an audio file:**
- Record yourself speaking for 30-60 seconds
- Save as `test-speech.mp3` or `test-speech.wav`
- Put it somewhere easy to find (like Desktop)

**Then upload it:**

```powershell
# Replace with your actual file path
$audioPath = "C:\Users\USER\Desktop\test-speech.mp3"

$form = @{
    audio = Get-Item $audioPath
    context = "Practice presentation about AI and machine learning"
}

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/upload" -Method POST -Form $form -Headers @{Authorization="Bearer $token"}

# Save the session ID
$sessionId = $uploadResponse.session.id
Write-Host "Session ID: $sessionId"
```

---

### 5️⃣ Analyze the Speech (AI Magic! 🤖)

```powershell
$analyzeResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/speech/analyze" -Method POST -Body "{`"sessionId`":`"$sessionId`"}" -ContentType "application/json" -Headers @{Authorization="Bearer $token"}

# Display the results
$analyzeResponse.analysis | ConvertTo-Json -Depth 5
```

**You'll get:**
- ✅ **Transcription** of your speech
- ✅ **Fluency Score** (0-100) - filler words analysis
- ✅ **Pace Score** (0-100) - words per minute
- ✅ **Tone Score** (0-100) - pitch variation
- ✅ **Confidence Score** (0-100) - voice stability
- ✅ **Overall Score** - combined rating
- ✅ **Detailed Feedback** for each category

---

### 6️⃣ View Your History

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/speech/history" -Method GET -Headers @{Authorization="Bearer $token"}
```

---

## 🎨 Better Option: Use a GUI Tool

### Option A: Thunder Client (VS Code Extension)

1. Install **Thunder Client** extension in VS Code
2. Create a new request
3. Set URL: `http://localhost:5000/api/auth/login`
4. Method: POST
5. Body (JSON):
   ```json
   {
     "email": "demo@test.com",
     "password": "demo123"
   }
   ```
6. Click **Send**
7. Copy the `access_token`
8. Use it in Authorization header for other requests

### Option B: Postman

1. Download Postman
2. Create new collection "StutterLess"
3. Add requests for each endpoint
4. Use Bearer Token authentication

---

## 📊 What the Analysis Tells You

### Fluency Score (0-100)
- **High (80-100)**: Few filler words, smooth speech
- **Medium (50-79)**: Some "um", "uh", "like"
- **Low (0-49)**: Many filler words, needs practice

### Pace Score (0-100)
- **Optimal**: 120-150 words per minute
- **Too Slow**: < 100 WPM (audience may lose interest)
- **Too Fast**: > 180 WPM (hard to follow)

### Tone Score (0-100)
- **High**: Good pitch variation, expressive
- **Low**: Monotone, needs more vocal variety

### Confidence Score (0-100)
- **High**: Stable voice, few hesitations
- **Low**: Shaky voice, many pauses

---

## 🎤 Don't Have an Audio File?

### Quick Ways to Get Test Audio:

1. **Record on Windows:**
   - Press `Win + G` (Game Bar)
   - Click microphone icon
   - Speak for 30-60 seconds
   - Stop recording
   - File saved in `Videos/Captures`

2. **Use Voice Recorder:**
   - Open "Voice Recorder" app (Windows)
   - Click record
   - Speak about any topic
   - Save the file

3. **Online TTS:**
   - Go to ttstool.com or similar
   - Generate speech from text
   - Download as MP3

---

## 🐛 Troubleshooting

**"User already exists"**
- Use a different email, or use the login endpoint

**"Invalid token"**
- Get a new token by logging in again
- Tokens expire after some time

**"File too large"**
- Maximum file size is 50MB
- Compress your audio file

**"Python script failed"**
- Make sure Python is installed and in PATH
- Check that all packages are installed: `pip list`

---

## ✅ Your Backend is Ready!

**What's working:**
- ✅ User authentication (signup/login)
- ✅ Protected API endpoints
- ✅ Audio file upload
- ✅ AI speech analysis (5 Python ML scripts)
- ✅ Speech history tracking
- ✅ Database storage (Supabase)

**Next step:** Build the frontend to make it user-friendly! 🎨
