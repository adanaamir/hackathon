// Dashboard Logic

let selectedFile = null;
let currentToken = null;
let overallChart = null;

// Check authentication on load
window.addEventListener('DOMContentLoaded', async () => {
    currentToken = TokenManager.get();

    if (!currentToken) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await API.auth.validateSession(currentToken);
        const user = response.user;

        // Display user name
        document.getElementById('userName').textContent = user.fullName || user.email;

        // Load history
        loadHistory();
    } catch (error) {
        console.error('Session validation failed:', error);
        TokenManager.clear();
        window.location.href = 'index.html';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    TokenManager.clear();
    window.location.href = 'index.html';
});

// File Upload Handling
const uploadArea = document.getElementById('uploadArea');
const audioFileInput = document.getElementById('audioFile');
const fileInfo = document.getElementById('fileInfo');
const uploadBtn = document.getElementById('uploadBtn');

uploadArea.addEventListener('click', () => {
    audioFileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f8f9ff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

audioFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'video/mp4'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a|mp4)$/i)) {
        alert('Please select a valid audio file (MP3, WAV, WebM, OGG, M4A, MP4)');
        return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
    }

    selectedFile = file;

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    uploadBtn.disabled = false;
}

document.getElementById('removeFile').addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    audioFileInput.value = '';
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    uploadBtn.disabled = true;
});

// Upload and Analyze
uploadBtn.addEventListener('click', async () => {
    const context = document.getElementById('speechContext').value.trim();

    if (!selectedFile) {
        alert('Please select an audio file');
        return;
    }

    if (!context) {
        alert('Please enter speech context');
        return;
    }

    // Show loading
    document.querySelector('.upload-card').style.display = 'none';
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('loadingCard').style.display = 'block';

    try {
        // Step 1: Upload
        updateLoadingStatus('Uploading audio file...', 25);
        const uploadResponse = await API.speech.upload(selectedFile, context, currentToken);
        const sessionId = uploadResponse.session.id;

        // Step 2: Analyze
        updateLoadingStatus('Analyzing your speech...', 50);
        const analysisResponse = await API.speech.analyze(sessionId, currentToken);

        updateLoadingStatus('Processing results...', 75);

        // Step 3: Display results
        setTimeout(() => {
            displayResults(analysisResponse.analysis);
            updateLoadingStatus('Complete!', 100);

            // Hide loading, show results
            setTimeout(() => {
                document.getElementById('loadingCard').style.display = 'none';
                document.getElementById('resultsCard').style.display = 'block';

                // Reset upload form
                selectedFile = null;
                audioFileInput.value = '';
                document.getElementById('speechContext').value = '';
                uploadArea.style.display = 'block';
                fileInfo.style.display = 'none';
                uploadBtn.disabled = true;

                // Reload history
                loadHistory();
            }, 500);
        }, 1000);

    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed: ' + error.message);

        // Show upload form again
        document.getElementById('loadingCard').style.display = 'none';
        document.querySelector('.upload-card').style.display = 'block';
    }
});

function updateLoadingStatus(status, progress) {
    document.getElementById('loadingStatus').textContent = status;
    document.getElementById('progressFill').style.width = progress + '%';
}

function displayResults(analysis) {
    // Overall score with chart
    const overallScore = analysis.overall_score;
    document.getElementById('overallScore').textContent = overallScore;

    createOverallChart(overallScore);

    // Individual scores
    updateScore('fluency', analysis.fluency_score);
    updateScore('pace', analysis.pace_score);
    updateScore('tone', analysis.tone_score);
    updateScore('confidence', analysis.confidence_score);

    // WPM
    if (analysis.wpm) {
        document.getElementById('wpmText').textContent = `${analysis.wpm} words per minute`;
    }

    // Transcription
    document.getElementById('transcriptionText').textContent = analysis.transcription || 'No transcription available';

    // Feedback
    if (analysis.feedback) {
        document.getElementById('fluencyFeedback').textContent = analysis.feedback.fluency || '-';
        document.getElementById('paceFeedback').textContent = analysis.feedback.pace || '-';
        document.getElementById('toneFeedback').textContent = analysis.feedback.tone || '-';
        document.getElementById('confidenceFeedback').textContent = analysis.feedback.confidence || '-';
    }
}

function updateScore(type, score) {
    document.getElementById(`${type}Score`).textContent = score;
    document.getElementById(`${type}Bar`).style.width = score + '%';
}

function createOverallChart(score) {
    const canvas = document.getElementById('overallScoreChart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (overallChart) {
        overallChart.destroy();
    }

    overallChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(230, 230, 230, 1)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            responsive: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

async function loadHistory() {
    try {
        const response = await API.speech.getHistory(currentToken);
        const history = response.history;

        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No analyses yet. Upload your first speech!</p>';
            return;
        }

        historyList.innerHTML = history.slice(0, 10).map(session => {
            const date = new Date(session.created_at).toLocaleDateString();
            const score = session.analysis_results && session.analysis_results.length > 0
                ? session.analysis_results[0].overall_score
                : 'N/A';

            return `
                <div class="history-item">
                    <div class="history-item-header">${session.context}</div>
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-score">${score}/100</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
