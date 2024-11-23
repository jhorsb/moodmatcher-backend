# Mood Matcher Backend Setup Guide

## Prerequisites

You need:

1. A JavaScript runtime environment
   - I used [Node.js](https://nodejs.org/), but you can use alternatives like:
     - Deno
     - Bun
     - Or any JavaScript server environment you like

2. A MySQL database
   - I used [XAMPP](https://www.apachefriends.org/) for its MySQL server
   - But you can use any MySQL-compatible database server

3. A code editor of your choice
   - VS Code, Sublime Text, WebStorm, etc.

## Database Requirements

Regardless of which MySQL solution you use, you need:

1. A MySQL server running on localhost:3306 (default port)
2. These tables in your database:
```sql
CREATE DATABASE mood_match;
USE mood_match;

-- Users table structure
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table structure
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, content_type, content_id)
);
```

## Configuration Needed

Create a `.env` file with:
```
# API Keys (required for content recommendations)
SPOTIFY_CLIENT_ID=2b3af4766c174abcb09d6480067d4653
SPOTIFY_CLIENT_SECRET=7ec9a803b2224191bf40a3173a8be25e
RAWG_API_KEY=5add932db94f477f8966fdf278edaf7f
TMDB_API_KEY=1b3dbb887a5fa09af0d13b65ecb37cdb

# Server settings
PORT=3000  # Change if needed
JWT_SECRET=your_secret_key_here

# Database connection (adjust based on your setup)
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=mood_match
```

## Required Dependencies

If using Node.js (package.json):
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.2"
  }
}
```

If using another environment, you need equivalent packages for:
- HTTP server
- MySQL database connection
- CORS handling
- Environment variables
- JWT authentication
- Password hashing
- HTTP client for API calls

## API Endpoints

The backend provides these endpoints (adjust base URL as needed):

### Authentication
```javascript
// Register
POST /auth/register
Body: { username, email, password }

// Login
POST /auth/login
Body: { email, password }
```

### Content Recommendations
```javascript
// Get recommendations
GET /api/recommendations?mood=[mood]&type=[type]
// mood: happy, sad, energetic, relaxed, angry
// type: music, movies, games, all
```

### Favorites Management
```javascript
// Get user's favorites
GET /api/favorites
Headers: { Authorization: 'Bearer [token]' }

// Add to favorites
POST /api/favorites
Headers: { Authorization: 'Bearer [token]' }
Body: { type, contentId, title }

// Remove from favorites
DELETE /api/favorites
Headers: { Authorization: 'Bearer [token]' }
Body: { type, contentId }
```

## Core Functionality Required

Our implementation must provide:
1. User authentication with JWT
2. MySQL database connection
3. API integrations (Spotify, TMDB, RAWG)
4. CORS handling for frontend requests
5. Favorites management system
6. Content recommendations based on mood

## Testing The Setup

The backend should respond to:
```bash
# Test server running
curl http://localhost:3000/

# Test recommendations
curl http://localhost:3000/api/recommendations?mood=happy&type=music

# Test authentication (after setup)
curl -X POST http://localhost:3000/auth/login -d '{"email":"test@test.com","password":"test123"}'
```


