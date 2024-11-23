document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    loadFavorites();
    setupFilterListeners();
});

async function loadFavorites() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/favorites', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favorites = await response.json();

        if (favorites.length === 0) {
            document.getElementById('no-favorites').classList.remove('hidden');
            document.getElementById('favorites-content').classList.add('hidden');
            return;
        }

        document.getElementById('no-favorites').classList.add('hidden');
        document.getElementById('favorites-content').classList.remove('hidden');
        
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error loading favorites:', error);
        showError('Failed to load favorites');
    }
}

function displayFavorites(favorites) {
    const container = document.getElementById('favorites-content');
    const currentFilter = document.querySelector('.filter-btn.active').dataset.type;

    const filteredFavorites = currentFilter === 'all' 
        ? favorites 
        : favorites.filter(fav => fav.content_type === currentFilter);

    const content = filteredFavorites.map(favorite => `
        <div class="favorite-item ${favorite.content_type}" data-id="${favorite.content_id}">
            <div class="favorite-content">
                <div class="media-tag ${favorite.content_type.toUpperCase()}">
                    ${favorite.content_type.toUpperCase()}
                </div>
                <h3>${favorite.title}</h3>
                ${favorite.preview_url ? `
                    <div class="audio-player">
                        <audio controls src="${favorite.preview_url}"></audio>
                    </div>
                ` : ''}
                <button onclick="removeFavorite('${favorite.content_id}', '${favorite.content_type}')" 
                        class="remove-favorite">
                    ❌
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = content || '<p class="no-content">No favorites found for this category</p>';
}

async function removeFavorite(contentId, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/favorites', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type,
                contentId
            })
        });

        if (!response.ok) throw new Error('Failed to remove favorite');
        
        loadFavorites();
        showToast('Removed from favorites');
    } catch (error) {
        console.error('Error removing favorite:', error);
        showToast('Failed to remove favorite', 'error');
    }
}

function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadFavorites();
        });
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const container = document.getElementById('favorites-content');
    container.innerHTML = `
        <div class="error-message">
            <p>😕 ${message}</p>
            <button onclick="loadFavorites()" class="retry-btn">Try Again</button>
        </div>
    `;
}