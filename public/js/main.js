document.addEventListener('DOMContentLoaded', () => {
    const emotionSelect = document.getElementById('emotion-select');
    const mediaSelect = document.getElementById('media-select');
    
    // Initialize event listeners
    if (emotionSelect && mediaSelect) {
        emotionSelect.addEventListener('change', fetchRecommendations);
        mediaSelect.addEventListener('change', fetchRecommendations);
        // Initial fetch if values are selected
        if (emotionSelect.value && mediaSelect.value) {
            fetchRecommendations();
        }
    }

    async function fetchRecommendations() {
        console.log('Fetching recommendations...');
        const emotion = emotionSelect.value;
        const mediaType = mediaSelect.value;
        
        if (!emotion || !mediaType) {
            console.log('No emotion or media type selected');
            return;
        }

        setLoadingState();

        try {
            const response = await fetch(`/api/recommendations?mood=${emotion}&type=${mediaType}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            displayResults(data, mediaType);
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to load recommendations. Please try again.');
        }
    }

    function setLoadingState() {
        ['other-results', 'main-results', 'similar-results'].forEach(id => {
            document.getElementById(id).innerHTML = '<div class="loading">Finding perfect matches...</div>';
        });
    }

    function displayResults(data, mediaType) {
        console.log('Displaying results for type:', mediaType);
        const mainResults = document.getElementById('main-results');
        const otherResults = document.getElementById('other-results');
        const similarResults = document.getElementById('similar-results');

        let allContent = [];
        
        // Process content based on type
        if (mediaType === 'all' || mediaType === 'music') {
            const musicItems = (data.music || []).map(track => ({
                content: createResultItem(track, 'music', {
                    title: track.name,
                    subtitle: track.artists[0].name,
                    preview: track.preview_url
                }),
                type: 'music'
            }));
            allContent = allContent.concat(musicItems);
        }

        if (mediaType === 'all' || mediaType === 'movies') {
            const movieItems = (data.movies || []).map(movie => ({
                content: createResultItem(movie, 'movie', {
                    title: movie.title,
                    subtitle: movie.release_date,
                }),
                type: 'movie'
            }));
            allContent = allContent.concat(movieItems);
        }

        if (mediaType === 'all' || mediaType === 'games') {
            const gameItems = (data.games || []).map(game => ({
                content: createResultItem(game, 'game', {
                    title: game.name,
                    subtitle: `Rating: ${game.rating}/5`
                }),
                type: 'game'
            }));
            allContent = allContent.concat(gameItems);
        }

        // Handle empty results
        if (allContent.length === 0) {
            const message = '<div class="no-content">No results available for the selected criteria</div>';
            mainResults.innerHTML = message;
            otherResults.innerHTML = message;
            similarResults.innerHTML = message;
            return;
        }

        // Shuffle and distribute content
        const shuffled = [...allContent].sort(() => Math.random() - 0.5);
        const perSection = Math.ceil(shuffled.length / 3);

        mainResults.innerHTML = shuffled.slice(0, perSection)
            .map(item => item.content)
            .join('');

        otherResults.innerHTML = shuffled.slice(perSection, perSection * 2)
            .map(item => item.content)
            .join('') || '<div class="no-content">No additional suggestions</div>';

        similarResults.innerHTML = shuffled.slice(perSection * 2)
            .map(item => item.content)
            .join('') || '<div class="no-content">No similar content</div>';
    }

    function createResultItem(item, type, content) {
        const token = localStorage.getItem('token');
        const mediaTag = `<span class="media-tag ${type.toUpperCase()}">${type.toUpperCase()}</span>`;
        
        const favoriteButton = token ? 
            `<button onclick="toggleFavorite(event, '${type}', '${item.id}', '${(content.title).replace(/'/g, "\\'")}')" 
                    class="favorite-btn">❤️</button>` : 
            `<a href="/login.html" class="favorite-btn">❤️</a>`;

        return `
            <div class="result-item">
                ${mediaTag}
                <div class="content-wrapper">
                    <h4>${content.title}</h4>
                    <p>${content.subtitle}</p>
                    ${content.preview ? `
                        <div class="audio-player">
                            <audio controls src="${content.preview}"></audio>
                        </div>` : ''
                    }
                </div>
                ${favoriteButton}
            </div>
        `;
    }
});

// Global functions
async function toggleFavorite(event, type, contentId, title) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type,
                contentId,
                title
            })
        });

        if (!response.ok) throw new Error('Failed to update favorites');

        const data = await response.json();
        showToast(data.message);
        
        // Toggle button appearance
        const button = event.target;
        button.classList.toggle('active');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating favorites', 'error');
    }
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function showError(message) {
    ['other-results', 'main-results', 'similar-results'].forEach(id => {
        document.getElementById(id).innerHTML = `
            <div class="error">
                ${message}
                <button onclick="location.reload()" class="retry-btn">Try Again</button>
            </div>
        `;
    });
}