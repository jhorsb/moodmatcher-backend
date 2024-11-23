const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Spotify token management
let spotifyToken = null;
let spotifyTokenExpiry = null;

async function getSpotifyToken() {
    try {
        if (spotifyToken && spotifyTokenExpiry > Date.now()) {
            return spotifyToken;
        }

        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'client_credentials'
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        spotifyToken = tokenResponse.data.access_token;
        spotifyTokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);
        return spotifyToken;
    } catch (error) {
        console.error('Spotify token error:', error.response?.data || error);
        throw error;
    }
}

// API Functions
async function getSpotifyRecommendations(mood) {
    try {
        const token = await getSpotifyToken();
        const searchTerm = `${mood} ${getMoodGenres(mood)}`;
        
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                q: searchTerm,
                type: 'track',
                limit: 15
            }
        });

        return response.data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists,
            preview_url: track.preview_url
        }));
    } catch (error) {
        console.error('Spotify API error:', error.response?.data || error);
        return [];
    }
}

async function getTMDBRecommendations(mood) {
    try {
        const genres = getMoodGenres(mood, 'movies');
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
                api_key: process.env.TMDB_API_KEY,
                with_genres: genres,
                sort_by: 'popularity.desc',
                page: 1,
                limit: 15
            }
        });

        return response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            release_date: new Date(movie.release_date).getFullYear(),
            rating: (movie.vote_average / 2).toFixed(1)
        }));
    } catch (error) {
        console.error('TMDB API error:', error.response?.data || error);
        return [];
    }
}

async function getRAWGRecommendations(mood) {
    try {
        const genres = getMoodGenres(mood, 'games');
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
                key: process.env.RAWG_API_KEY,
                genres: genres,
                ordering: '-rating',
                page_size: 15
            }
        });

        return response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            rating: (game.rating || 0).toFixed(1)
        }));
    } catch (error) {
        console.error('RAWG API error:', error.response?.data || error);
        return [];
    }
}

// Helper function for genres
function getMoodGenres(mood, type = 'music') {
    const moodMappings = {
        happy: {
            music: 'genre:pop genre:dance',
            movies: '35,16',  // Comedy, Animation
            games: '10,15'    // Racing, Sports
        },
        sad: {
            music: 'genre:indie genre:acoustic',
            movies: '18,10749', // Drama, Romance
            games: '13,19'     // Indie, Strategy
        },
        energetic: {
            music: 'genre:edm genre:rock',
            movies: '28,12',   // Action, Adventure
            games: '4,1'       // Action, Racing
        },
        relaxed: {
            music: 'genre:ambient genre:classical',
            movies: '99,10751', // Documentary, Family
            games: '7,51'      // Puzzle, Casual
        },
        angry: {
            music: 'genre:metal genre:rock',
            movies: '28,53',   // Action, Thriller
            games: '2,5'       // Shooter, Fighting
        }
    };

    return moodMappings[mood]?.[type] || '';
}

// Main route handler
router.get('/', async (req, res) => {
    try {
        const { mood, type } = req.query;
        console.log('Fetching recommendations for:', { mood, type });

        if (!mood) {
            return res.status(400).json({ error: 'Mood is required' });
        }

        const recommendations = {
            music: [],
            movies: [],
            games: []
        };

        const promises = [];

        if (type === 'all' || type === 'music') {
            promises.push(
                getSpotifyRecommendations(mood)
                    .then(data => recommendations.music = data)
            );
        }

        if (type === 'all' || type === 'movies') {
            promises.push(
                getTMDBRecommendations(mood)
                    .then(data => recommendations.movies = data)
            );
        }

        if (type === 'all' || type === 'games') {
            promises.push(
                getRAWGRecommendations(mood)
                    .then(data => recommendations.games = data)
            );
        }

        await Promise.all(promises);
        
        console.log('Recommendations found:', {
            music: recommendations.music.length,
            movies: recommendations.movies.length,
            games: recommendations.games.length
        });

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ 
            error: 'Failed to get recommendations',
            details: error.message 
        });
    }
});

module.exports = router;