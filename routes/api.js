const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const SpotifyWebApi = require('spotify-web-api-node');

const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const moodMappings = {
    happy: {
        spotify: {
            seed_genres: 'pop,happy,dance',
            target_valence: 0.8,
            target_energy: 0.8,
            min_popularity: 50
        },
        tmdb: {
            genres: '35,16,10402',
            sort: 'popularity.desc'
        },
        rawg: {
            genres: 'indie,casual,family'
        }
    },
    sad: {
        spotify: {
            seed_genres: 'acoustic,sad,indie',
            target_valence: 0.3,
            target_energy: 0.4,
            min_popularity: 50
        },
        tmdb: {
            genres: '18,10749',
            sort: 'vote_average.desc'
        },
        rawg: {
            genres: 'rpg,adventure'
        }
    },
    energetic: {
        spotify: {
            seed_genres: 'electronic,dance,rock',
            target_valence: 0.7,
            target_energy: 0.9,
            min_popularity: 50
        },
        tmdb: {
            genres: '28,12,878',
            sort: 'popularity.desc'
        },
        rawg: {
            genres: 'action,racing'
        }
    },
    relaxed: {
        spotify: {
            seed_genres: 'ambient,classical,chill',
            target_valence: 0.5,
            target_energy: 0.3,
            min_popularity: 50
        },
        tmdb: {
            genres: '99,36,10751',
            sort: 'vote_average.desc'
        },
        rawg: {
            genres: 'puzzle,strategy'
        }
    }
};

async function getSpotifyToken() {
    try {
        const data = await spotify.clientCredentialsGrant();
        return data.body['access_token'];
    } catch (error) {
        console.error('Spotify token error:', error);
        throw error;
    }
}

async function getSpotifyRecommendations(mood, token) {
    spotify.setAccessToken(token);
    const moodConfig = moodMappings[mood].spotify;
    
    try {
        const response = await spotify.getRecommendations({
            seed_genres: moodConfig.seed_genres,
            target_valence: moodConfig.target_valence,
            target_energy: moodConfig.target_energy,
            min_popularity: moodConfig.min_popularity,
            limit: 30 // Request more tracks to increase chances of previews
        });

        const tracks = response.body.tracks || [];
        const tracksWithPreview = tracks.filter(track => track.preview_url);
        const tracksWithoutPreview = tracks.filter(track => !track.preview_url);
        
        return [...tracksWithPreview, ...tracksWithoutPreview].slice(0, 15);
    } catch (error) {
        console.error('Spotify recommendations error:', error);
        return [];
    }
}

router.get('/recommendations', async (req, res) => {
    try {
        const { mood, type = 'all' } = req.query;
        if (!moodMappings[mood]) {
            return res.status(400).json({ error: 'Invalid mood selected' });
        }

        let musicData = [], moviesData = [], gamesData = [];

        if (type === 'all' || type === 'music') {
            const token = await getSpotifyToken();
            musicData = await getSpotifyRecommendations(mood, token);
        }

        if (type === 'all' || type === 'movies') {
            const movieResponse = await fetch(
                `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${moodMappings[mood].tmdb.genres}&sort_by=${moodMappings[mood].tmdb.sort}&page=1`
            );
            const movieData = await movieResponse.json();
            moviesData = movieData.results || [];
        }

        if (type === 'all' || type === 'games') {
            const gameResponse = await fetch(
                `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&genres=${moodMappings[mood].rawg.genres}&ordering=-rating&page_size=15`
            );
            const gameData = await gameResponse.json();
            gamesData = gameData.results || [];
        }

        res.json({
            music: musicData,
            movies: moviesData.slice(0, 15),
            games: gamesData.slice(0, 15)
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: error.message,
            music: [],
            movies: [],
            games: []
        });
    }
});

module.exports = router;