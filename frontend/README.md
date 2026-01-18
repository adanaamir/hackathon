# SpeakSmart Frontend

Beautiful, modern web interface for SpeakSmart AI speech coaching.

## ✨ Features

### Authentication
- ✅ Login/Register toggle
- ✅ Email & password validation
- ✅ Automatic token management
- ✅ Session persistence
- ✅ Beautiful gradient UI with animations

### Dashboard
- ✅ Drag & drop audio upload
- ✅ File validation (type & size)
- ✅ Speech context input
- ✅ Real-time analysis progress
- ✅ Beautiful score visualizations
- ✅ Circular progress chart for overall score
- ✅ Individual score bars with gradients
- ✅ Full transcription display
- ✅ Detailed feedback for each category
- ✅ Speech history sidebar
- ✅ Responsive design (mobile-friendly)

## 🚀 How to Run

### Option 1: Simple HTTP Server (Recommended)

```bash
cd C:\Users\USER\OneDrive\Desktop\hackathon\frontend
python -m http.server 3000
```

Then open: **http://localhost:3000**

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Click "Open with Live Server"

### Option 3: Direct File Open

Simply double-click `index.html` (may have CORS issues with API calls)

## 📋 Prerequisites

**Backend must be running:**
```bash
cd C:\Users\USER\OneDrive\Desktop\hackathon\backend
npm run dev
```

Backend should be on: `http://localhost:5000`

## 🎯 How to Use

### 1. Register/Login
- Open `http://localhost:3000`
- Click "Register" tab
- Enter your name, email, and password
- Click "Create Account"
- You'll be automatically logged in

### 2. Upload Speech
- Click the upload area or drag & drop an audio file
- Supported formats: MP3, WAV, WebM, OGG, M4A, MP4
- Max size: 50MB
- Enter speech context (e.g., "Practice presentation")
- Click "Upload & Analyze"

### 3. View Results
- Wait for analysis (30-60 seconds)
- See your overall score (0-100)
- View individual scores:
  - **Fluency**: Filler words analysis
  - **Pace**: Words per minute
  - **Tone**: Pitch variation
  - **Confidence**: Voice stability
- Read full transcription
- Get detailed feedback for improvement

### 4. Check History
- View past analyses in the sidebar
- See scores and dates

## 🎨 Design Features

- **Modern UI**: Gradient backgrounds, glassmorphism
- **Smooth Animations**: Fade-ins, slide-ups, hover effects
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Clear labels, good contrast
- **Professional**: Clean, hackathon-winning aesthetic

## 📁 File Structure

```
frontend/
├── index.html              # Login/Register page
├── dashboard.html          # Main app dashboard
├── css/
│   ├── styles.css         # Auth page styles
│   └── dashboard.css      # Dashboard styles
└── js/
    ├── api.js             # API helper functions
    ├── auth.js            # Authentication logic
    └── dashboard.js       # Dashboard functionality
```

## 🔧 Configuration

API endpoint is configured in `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Change this if your backend runs on a different port.

## 🐛 Troubleshooting

**"Failed to fetch" error:**
- Make sure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify backend CORS settings allow `http://localhost:3000`

**Login/Register not working:**
- Check backend logs for errors
- Verify Supabase credentials in backend `.env`
- Check network tab in browser DevTools

**File upload fails:**
- Check file format (must be audio)
- Verify file size < 50MB
- Check backend upload directory exists

**Analysis takes too long:**
- Normal for first analysis (Python scripts loading)
- Subsequent analyses should be faster
- Check backend console for Python errors

## ✅ What's Working

- ✅ Beautiful authentication UI
- ✅ Login/Register with Supabase
- ✅ Token-based session management
- ✅ Protected dashboard route
- ✅ File upload with drag & drop
- ✅ Real-time analysis progress
- ✅ Score visualizations with Chart.js
- ✅ Transcription display
- ✅ Detailed feedback
- ✅ Speech history
- ✅ Responsive design
- ✅ Smooth animations

## 🏆 Hackathon Ready!

This frontend is designed to impress judges with:
- **Visual Appeal**: Modern, professional design
- **User Experience**: Intuitive, easy to use
- **Functionality**: All features working
- **Polish**: Animations, loading states, error handling
- **Responsiveness**: Works on all devices

## 🎬 Demo Flow

1. **Landing**: Beautiful gradient background with login/register
2. **Register**: Quick signup with name, email, password
3. **Dashboard**: Clean interface with upload area
4. **Upload**: Drag & drop audio file
5. **Analysis**: Smooth loading animation
6. **Results**: Stunning score display with charts
7. **Feedback**: Actionable improvement suggestions
8. **History**: Track progress over time

Good luck with your hackathon! 🚀
