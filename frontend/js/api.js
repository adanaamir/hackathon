// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
const API = {
    // POST request
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // POST request with file upload
    async postFile(endpoint, formData, token) {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint, token) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Authentication endpoints
    auth: {
        async signup(email, password, fullName) {
            return await API.post('/auth/signup', { email, password, fullName });
        },

        async login(email, password) {
            return await API.post('/auth/login', { email, password });
        },

        async validateSession(token) {
            return await API.get('/auth/session', token);
        }
    },

    // Speech endpoints
    speech: {
        async upload(audioFile, context, token) {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('context', context);
            return await API.postFile('/speech/upload', formData, token);
        },

        async analyze(sessionId, token) {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${API_BASE_URL}/speech/analyze`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ sessionId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Analysis failed');
            }

            return result;
        },

        async getHistory(token) {
            return await API.get('/speech/history', token);
        },

        async getById(id, token) {
            return await API.get(`/speech/${id}`, token);
        }
    }
};

// Token Management
const TokenManager = {
    save(token) {
        localStorage.setItem('speaksmart_token', token);
    },

    get() {
        return localStorage.getItem('speaksmart_token');
    },

    remove() {
        localStorage.removeItem('speaksmart_token');
    },

    saveUser(user) {
        localStorage.setItem('speaksmart_user', JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem('speaksmart_user');
        return user ? JSON.parse(user) : null;
    },

    removeUser() {
        localStorage.removeItem('speaksmart_user');
    },

    clear() {
        this.remove();
        this.removeUser();
    }
};
