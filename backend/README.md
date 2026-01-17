# SpeakSmart Backend

AI-powered speech rehearsal assistant backend with Supabase authentication and Python ML analysis.

## Features

- 🔐 **User Authentication** - Secure signup/login with Supabase
- 🎤 **Speech Upload** - Audio file upload with validation
- 🤖 **AI Analysis** - ML-powered speech analysis
  - Speech-to-text conversion
  - Fluency analysis (filler words, repetitions)
  - Pace analysis (WPM, speaking rate)
  - Tone analysis (pitch variation, monotone detection)
  - Confidence analysis (voice stability, hesitation)
- 📊 **Feedback Dashboard** - Structured feedback with scores
- 📝 **History Tracking** - Store and retrieve past analyses

## Tech Stack

**Backend:**
- Node.js + Express.js
- Supabase (Authentication & Database)
- Multer (File uploads)

**AI/ML:**
- Python 3.8+
- SpeechRecognition (Speech-to-text)
- Librosa (Audio analysis)
- NumPy, SciPy (Signal processing)

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Supabase account
- FFmpeg (for audio processing)

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Install Python Dependencies

```bash
pip install -r python/requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

MAX_FILE_SIZE_MB=50
UPLOAD_DIR=./uploads
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - `supabase/migrations/001_create_speech_sessions.sql`
   - `supabase/migrations/002_create_analysis_results.sql`

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": { "id": "...", "email": "...", "fullName": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### POST `/api/auth/login`
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### GET `/api/auth/session`
Validate current session (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": { "id": "...", "email": "...", "fullName": "..." }
}
```

### Speech Analysis Endpoints

All speech endpoints require authentication via `Authorization: Bearer <token>` header.

#### POST `/api/speech/upload`
Upload audio file and create speech session.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `audio`: Audio file (mp3, wav, webm, ogg, m4a)
  - `context`: Speech context/topic (text)

**Response:**
```json
{
  "success": true,
  "message": "Speech uploaded successfully",
  "session": {
    "id": "session-uuid",
    "context": "Presentation about AI",
    "createdAt": "2024-01-17T..."
  }
}
```

#### POST `/api/speech/analyze`
Analyze uploaded speech.

**Request:**
```json
{
  "sessionId": "session-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "analysis": {
    "id": "analysis-uuid",
    "fluency_score": 85,
    "pace_score": 78,
    "tone_score": 82,
    "confidence_score": 80,
    "overall_score": 81,
    "wpm": 135,
    "filler_words": [
      { "word": "um", "count": 3 },
      { "word": "like", "count": 5 }
    ],
    "feedback": {
      "fluency": "Good fluency overall...",
      "pace": "Excellent pace at 135 WPM...",
      "tone": "Good pitch variation...",
      "confidence": "Good confidence level..."
    },
    "transcription": "Full speech text...",
    "context": "Presentation about AI"
  }
}
```

#### GET `/api/speech/history`
Get user's speech analysis history.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "session-uuid",
      "context": "Presentation about AI",
      "created_at": "2024-01-17T...",
      "analysis_results": {
        "overall_score": 81,
        "fluency_score": 85,
        "pace_score": 78,
        "tone_score": 82,
        "confidence_score": 80
      }
    }
  ],
  "pagination": { "limit": 10, "offset": 0, "total": 1 }
}
```

#### GET `/api/speech/:id`
Get specific speech analysis by ID.

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-uuid",
    "context": "Presentation about AI",
    "transcription": "Full text...",
    "createdAt": "2024-01-17T..."
  },
  "analysis": { /* full analysis object */ }
}
```

#### DELETE `/api/speech/:id`
Delete speech session and analysis.

**Response:**
```json
{
  "success": true,
  "message": "Speech session deleted successfully"
}
```

## Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/
│   └── speechController.js  # Speech analysis business logic
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload configuration
├── python/
│   ├── speech_to_text.py    # Speech recognition
│   ├── fluency_analysis.py  # Filler word detection
│   ├── pace_analysis.py     # WPM calculation
│   ├── tone_analysis.py     # Pitch/energy analysis
│   ├── confidence_analysis.py # Voice stability analysis
│   └── requirements.txt     # Python dependencies
├── routes/
│   ├── auth.js              # Authentication routes
│   └── speech.js            # Speech analysis routes
├── supabase/
│   └── migrations/          # Database migrations
├── utils/
│   └── pythonRunner.js      # Python script executor
├── uploads/                 # Audio file storage (gitignored)
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main application entry
```

## Analysis Metrics

### Fluency Score (0-100)
- Detects filler words (um, uh, like, etc.)
- Identifies repetitions
- Lower filler percentage = higher score

### Pace Score (0-100)
- Calculates words per minute (WPM)
- Optimal range: 120-150 WPM
- Analyzes speech rate variation

### Tone Score (0-100)
- Measures pitch variation
- Detects monotone speech
- Analyzes energy/volume variation

### Confidence Score (0-100)
- Voice stability analysis
- Hesitation detection
- Pause frequency evaluation

### Overall Score
Weighted average of all four metrics (25% each)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## Security

- JWT-based authentication via Supabase
- Row Level Security (RLS) on database tables
- File type and size validation
- CORS configuration
- Environment variable protection

## Troubleshooting

**Python scripts not executing:**
- Ensure Python is in your PATH
- Verify all dependencies are installed: `pip install -r python/requirements.txt`

**Audio file upload fails:**
- Check file size (max 50MB by default)
- Verify file format (mp3, wav, webm, ogg, m4a)
- Ensure `uploads/` directory exists

**Database errors:**
- Verify Supabase credentials in `.env`
- Ensure migrations are run in Supabase dashboard
- Check RLS policies are enabled

## License

MIT
