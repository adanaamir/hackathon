# 🎤 StutterLess - AI Speech Coach

> Transform your public speaking with real-time AI-powered speech analysis and personalized feedback.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)

## 🌟 Overview

StutterLess is an intelligent speech coaching platform that helps users improve their public speaking skills through comprehensive AI-driven analysis. Upload your speech recordings and receive detailed feedback on fluency, pace, tone, and confidence.

### ✨ Key Features

- 🎯 **Multi-Dimensional Analysis**
  - Fluency scoring with filler word detection
  - Speaking pace analysis (WPM calculation)
  - Tone variation and pitch analysis
  - Confidence level assessment

- 🤖 **AI-Powered Insights**
  - Real-time speech-to-text transcription
  - Advanced audio processing with librosa
  - Personalized feedback and recommendations
  - Historical performance tracking

- 🔐 **Secure & Private**
  - User authentication with Supabase
  - Secure file uploads
  - Session-based analysis storage

- 💻 **Modern Interface**
  - Beautiful, responsive dashboard
  - Real-time progress tracking
  - Interactive score visualizations
  - Analysis history timeline

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hackathon
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   pip install -r python/requirements.txt
   ```

3. **Configure Environment**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   MAX_FILE_SIZE_MB=50
   UPLOAD_DIR=./uploads
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```

5. **Start Frontend Server**
   ```bash
   cd ../frontend
   python -m http.server 3000
   ```

6. **Open Application**
   
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
hackathon/
├── backend/                 # Node.js + Express backend
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & upload middleware
│   ├── python/            # Python analysis scripts
│   │   ├── speech_to_text.py
│   │   ├── fluency_analysis.py
│   │   ├── pace_analysis.py
│   │   ├── tone_analysis.py
│   │   └── confidence_analysis.py
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Main server file
│
└── frontend/              # Static web frontend
    ├── css/              # Stylesheets
    ├── js/               # JavaScript modules
    ├── index.html        # Landing page
    └── dashboard.html    # Main dashboard
```

## 🎯 How It Works

1. **Upload**: Users upload audio files (MP3, WAV, M4A, MP4)
2. **Transcribe**: Speech-to-text conversion using Google Speech Recognition
3. **Analyze**: Parallel processing of 4 analysis dimensions:
   - Fluency (filler words, repetitions)
   - Pace (words per minute, rate variation)
   - Tone (pitch variation, monotone detection)
   - Confidence (energy levels, vocal strength)
4. **Score**: Weighted scoring algorithm generates overall performance score
5. **Feedback**: Personalized recommendations for improvement

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Upload**: Multer
- **Audio Processing**: Python with librosa, soundfile

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with modern design
- **Charts**: Chart.js for visualizations
- **HTTP**: Fetch API for backend communication

### Python Analysis
- **Speech Recognition**: SpeechRecognition library
- **Audio Processing**: librosa, soundfile
- **Data Analysis**: NumPy for statistical calculations

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Validate session

### Speech Analysis
- `POST /api/speech/upload` - Upload audio file
- `POST /api/speech/analyze` - Analyze uploaded speech
- `GET /api/speech/history` - Get analysis history
- `GET /api/speech/:id` - Get specific analysis
- `DELETE /api/speech/:id` - Delete analysis

## 🎨 Features Showcase

### Analysis Dashboard
- Real-time upload progress
- Comprehensive score breakdown
- Visual score representations
- Detailed feedback sections
- Historical analysis tracking

### Scoring System
- **Fluency** (25%): Filler words, repetitions, flow
- **Pace** (25%): Speaking rate, variation
- **Tone** (25%): Pitch variation, expressiveness
- **Confidence** (25%): Energy, vocal strength

**Overall Score**: Weighted average of all dimensions (0-100)

## 🔧 Configuration

### Supported Audio Formats
- MP3, WAV, WebM, OGG, M4A, MP4
- Maximum file size: 50MB
- Recommended: Clear audio, minimal background noise

### Python Dependencies
```txt
SpeechRecognition==3.14.5
librosa==0.11.0
soundfile==0.13.1
numpy
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

**Python script errors**
- Ensure all Python dependencies are installed
- Check Python version (3.12+ required)
- Verify audio file format compatibility

**Analysis fails**
- Check backend logs for detailed error messages
- Verify Supabase connection
- Ensure audio file is not corrupted

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Speech Recognition API
- Supabase for backend infrastructure
- librosa for audio processing capabilities
- Chart.js for beautiful visualizations

## 📧 Contact

For questions or feedback, please open an issue in this repository.

---

**Built with ❤️ for improving public speaking skills**
