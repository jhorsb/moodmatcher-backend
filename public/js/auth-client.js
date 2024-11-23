document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const token = localStorage.getItem('token');
    const authControls = document.getElementById('auth-controls');
    
    if (token) {
        const username = localStorage.getItem('username');
        authControls.innerHTML = `
            <span class="username">${username}</span>
            <button onclick="logout()" class="auth-btn">Logout</button>
        `;
    } else {
        authControls.innerHTML = `
            <a href="/login.html" class="auth-btn">Login</a>
            <a href="/register.html" class="auth-btn register">Register</a>
        `;
    }
}

async function login(email, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        
        window.location.href = '/mood.html';
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function register(username, email, password) {
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Automatically log in after registration
        await login(email, password);
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
}

// Make functions available globally
window.login = login;
window.register = register;
window.logout = logout;