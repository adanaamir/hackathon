# StutterLess Backend - Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed successfully:
- ✅ Python packages (SpeechRecognition, librosa, numpy, scipy, soundfile, audioread)
- ✅ Node.js packages (Express, Supabase, Multer, etc.)

---

## 🔧 Next Steps

### 1. Configure Supabase

**Get your Supabase credentials:**
1. Go to https://app.supabase.com
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://wqswazfcpsktkkxpzbgh.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxc3dhemZjcHNrdGtreHB6YmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzA5ODAsImV4cCI6MjA4NDIwNjk4MH0.SGAAJ1ujfpNssRLehYaLBTFVyqBRHsB1aSmVB-fNKMc`)

**Update `.env` file:**
Open `backend/.env` and replace the placeholder values:
```env
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 2. Set Up Database Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run these migration files **in order**:

**First:** `supabase/migrations/001_create_speech_sessions.sql`
- Creates `speech_sessions` table
- Sets up Row Level Security (RLS)
- Adds indexes for performance

**Second:** `supabase/migrations/002_create_analysis_results.sql`
- Creates `analysis_results` table
- Sets up RLS policies
- Links to speech_sessions

### 3. Start the Server

```bash
cd backend
npm run dev
```

Server will start on: **http://localhost:5000**

You should see:
```
✓ Supabase connected successfully
🚀 StutterLess Backend Server
📡 Running on port 5000
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "StutterLess API is running",
  "timestamp": "..."
}
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Validate session

### Speech Analysis (requires auth)
- `POST /api/speech/upload` - Upload audio file
- `POST /api/speech/analyze` - Analyze speech
- `GET /api/speech/history` - Get analysis history
- `GET /api/speech/:id` - Get specific analysis
- `DELETE /api/speech/:id` - Delete session

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register User
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the `access_token` from the response.

### 3. Upload Speech
```
POST http://localhost:5000/api/speech/upload
Authorization: Bearer <your_access_token>
Content-Type: multipart/form-data

audio: <select_audio_file.mp3>
context: "Practice presentation"
```

### 4. Analyze Speech
```
POST http://localhost:5000/api/speech/analyze
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "sessionId": "<session_id_from_upload>"
}
```

---

## 📁 Project Structure

```
backend/
├── config/          # Supabase configuration
├── controllers/     # Business logic
├── middleware/      # Auth & upload middleware
├── python/          # ML analysis scripts
├── routes/          # API endpoints
├── supabase/        # Database migrations
├── utils/           # Helper functions
├── .env             # Environment variables (DO NOT COMMIT)
└── server.js        # Main application
```

---

## 🐛 Troubleshooting

**"Supabase connection error"**
- Check your `.env` file has correct credentials
- Verify Supabase project is active

**"Python script failed"**
- Ensure Python is in your PATH
- Verify all packages installed: `pip list`

**"Audio file upload fails"**
- Check file format (mp3, wav, webm, ogg, m4a)
- Verify file size < 50MB

---

## 📖 Full Documentation

See `README.md` for complete API documentation and examples.

---

## 🎯 Ready for Frontend!

Once the backend is running, you can start building the frontend with:
- React.js for UI
- Axios for API calls
- Chart.js for visualizations
- React Mic for audio recording
