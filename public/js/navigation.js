document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const allLinks = document.querySelectorAll('.nav-links a');
    
    allLinks.forEach(link => link.classList.remove('active'));
    
    if (path.includes('index') || path === '/') {
        document.getElementById('home-link')?.classList.add('active');
    } else if (path.includes('mood')) {
        document.getElementById('mood-link')?.classList.add('active');
    } else if (path.includes('browse')) {
        document.getElementById('browse-link')?.classList.add('active');
    } else if (path.includes('favourites')) {
        document.getElementById('favourites-link')?.classList.add('active');
    } else if (path.includes('account')) {
        document.querySelector('.profile-icon')?.classList.add('active');
    }
});