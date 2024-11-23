function updateAuthStatus() {
    const token = localStorage.getItem('token');
    const authSection = document.getElementById('auth-section');
    
    if (token) {
        const username = localStorage.getItem('username');
        authSection.innerHTML = `
            <span>Welcome, ${username}</span>
            <button onclick="logout()" class="auth-button">Logout</button>
        `;
    } else {
        authSection.innerHTML = `
            <a href="/login.html" class="auth-button">Login</a>
            <a href="/register.html" class="auth-button">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', updateAuthStatus);