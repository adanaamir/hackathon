// Authentication Logic

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = TokenManager.get();
    if (token) {
        // Validate token and redirect to dashboard
        validateAndRedirect(token);
    }
});

async function validateAndRedirect(token) {
    try {
        await API.auth.validateSession(token);
        window.location.href = 'dashboard.html';
    } catch (error) {
        // Token invalid, clear and stay on login page
        TokenManager.clear();
    }
}

// Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update active tab
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show corresponding form
        if (tab === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }

        // Clear errors
        hideError('loginError');
        hideError('registerError');
    });
});

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
    }

    showLoading();
    hideError('loginError');

    try {
        const response = await API.auth.login(email, password);

        // Save token and user info
        TokenManager.save(response.session.access_token);
        TokenManager.saveUser(response.user);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        hideLoading();
        showError('loginError', error.message || 'Login failed. Please check your credentials.');
    }
});

// Register Form Submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!fullName || !email || !password) {
        showError('registerError', 'Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters');
        return;
    }

    showLoading();
    hideError('registerError');

    try {
        const response = await API.auth.signup(email, password, fullName);

        // Save token and user info
        TokenManager.save(response.session.access_token);
        TokenManager.saveUser(response.user);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        hideLoading();
        showError('registerError', error.message || 'Registration failed. Email might already be in use.');
    }
});

// Helper Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => form.style.display = 'none');
    spinner.classList.add('show');
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const activeForm = document.querySelector('.auth-form.active');

    spinner.classList.remove('show');
    if (activeForm) {
        activeForm.style.display = 'block';
    }
}
