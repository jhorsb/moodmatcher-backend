const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Add to favorites
router.post('/', auth, async (req, res) => {
    try {
        const { type, contentId, title } = req.body;
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user.userId;

        // Check if already exists
        const [existing] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND content_type = ? AND content_id = ?',
            [userId, type, contentId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already in favorites' });
        }

        // Add new favorite
        await db.query(
            'INSERT INTO favorites (user_id, content_type, content_id, title) VALUES (?, ?, ?, ?)',
            [userId, type, contentId, title]
        );

        res.json({ message: 'Added to favorites' });
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Remove from favorites
router.delete('/', auth, async (req, res) => {
    try {
        const { type, contentId } = req.body;
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user.userId;

        // Remove favorite
        await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND content_type = ? AND content_id = ?',
            [userId, type, contentId]
        );

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const [favorites] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );

        res.json(favorites);
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

module.exports = router;