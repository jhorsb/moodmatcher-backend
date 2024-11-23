const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files with correct MIME types
app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.svg')) {
            res.set('Content-Type', 'image/svg+xml');
        }
    }
}));

// Initialize routes
const authRoutes = require('./routes/auth');
const recommendationsRoutes = require('./routes/recommendations');
const favoritesRoutes = require('./routes/favorites');

// Use routes
app.use('/auth', authRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Test database connection
    const db = require('./config/database');
    db.query('SELECT 1')
        .then(() => {
            console.log('Database connection successful');
        })
        .catch(err => {
            console.error('Database connection failed:', err);
        });
});