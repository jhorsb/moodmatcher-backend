require('dotenv').config();

const apis = {
    spotify: {
        clientId: '2b3af4766c174abcb09d6480067d4653',
        clientSecret: '7ec9a803b2224191bf40a3173a8be25e',
        redirectUri: 'http://127.0.0.1:3000/callback',
        baseUrl: 'https://api.spotify.com/v1'
    },
    tmdb: {
        apiKey: '1b3dbb887a5fa09af0d13b65ecb37cdb',
        baseUrl: 'https://api.themoviedb.org/3'
    },
    rawg: {
        apiKey: '5add932db94f477f8966fdf278edaf7f',
        baseUrl: 'https://api.rawg.io/api'
    }
};

module.exports = apis;